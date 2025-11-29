import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { RecochoGame, RecochoPlayer, CreateRecochoParams } from '../features/recocho/types';
import { useAuth } from '../context/AuthContext';

export function useRecocho() {
    const { user } = useAuth();
    const [activeGames, setActiveGames] = useState<RecochoGame[]>([]);
    const [currentGame, setCurrentGame] = useState<RecochoGame | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [myGames, setMyGames] = useState<RecochoGame[]>([]);

    // Generate a random 6-character code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // Load active games (limit 5 check happens on creation, but we load all active ones here)
    useEffect(() => {
        const q = query(
            collection(db, 'recochos'),
            where('status', '==', 'active')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const games = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RecochoGame[];
            setActiveGames(games);
        }, (err) => {
            console.error("Error fetching games:", err);
            setError("Error al cargar los partidos");
        });

        return () => unsubscribe();
    }, []);

    // Load my games if user is logged in
    useEffect(() => {
        if (!user) {
            setMyGames([]);
            return;
        }

        const q = query(
            collection(db, 'recochos'),
            where('createdBy', '==', user.uid),
            limit(10) // Limit to last 10 games
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const games = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RecochoGame[];
            // Sort by createdAt desc (client side since we didn't add index yet)
            games.sort((a, b) => b.createdAt - a.createdAt);
            setMyGames(games);
        }, (err) => {
            console.error("Error fetching my games:", err);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to current game changes
    useEffect(() => {
        if (!currentGame?.id) return;

        const unsubscribe = onSnapshot(doc(db, 'recochos', currentGame.id), (doc) => {
            if (doc.exists()) {
                setCurrentGame({ id: doc.id, ...doc.data() } as RecochoGame);
            } else {
                setCurrentGame(null);
            }
        }, (err) => {
            console.error("Error syncing game:", err);
        });

        return () => unsubscribe();
    }, [currentGame?.id]);

    const createGame = async (params: CreateRecochoParams): Promise<string | null> => {
        setLoading(true);
        setError(null);
        try {
            // Check active games limit
            const q = query(
                collection(db, 'recochos'),
                where('status', '==', 'active')
            );
            const snapshot = await getDocs(q);

            if (snapshot.size >= 5) {
                setError("Ya hay 5 salas activas. Por favor espera a que termine una.");
                return null;
            }

            const code = generateCode();
            const newGame: Omit<RecochoGame, 'id'> = {
                code,
                createdAt: Date.now(),
                teamSize: params.teamSize,
                pitchPrice: params.pitchPrice,
                players: [],
                createdBy: user ? user.uid : (params.creatorName || 'Guest'),
                status: 'active'
            };

            const docRef = await addDoc(collection(db, 'recochos'), newGame);
            // We don't set currentGame here, the caller (RecochoApp) should handle navigation/joining
            // But to trigger the subscription, we need to set it.
            // Let's set it here so the effect picks it up.
            setCurrentGame({ id: docRef.id, ...newGame } as RecochoGame);
            return docRef.id;
        } catch (err) {
            console.error("Error creating game:", err);
            setError("No se pudo crear la sala");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const joinGame = async (code: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'recochos'),
                where('code', '==', code.toUpperCase()),
                where('status', '==', 'active'),
                limit(1)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setError("Sala no encontrada o inactiva");
                return false;
            }

            const gameDoc = snapshot.docs[0];
            // Setting current game will trigger the useEffect subscription
            setCurrentGame({ id: gameDoc.id, ...gameDoc.data() } as RecochoGame);
            return true;
        } catch (err) {
            console.error("Error joining game:", err);
            setError("Error al unirse a la sala");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = async (gameId: string, name: string, team: 'A' | 'B') => {
        if (!currentGame) return;

        try {
            const newPlayer: RecochoPlayer = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                isGuest: !user,
                team,
                addedAt: Date.now()
            };

            const updatedPlayers = [...currentGame.players, newPlayer];
            await updateDoc(doc(db, 'recochos', gameId), {
                players: updatedPlayers
            });
        } catch (err) {
            console.error("Error adding player:", err);
            setError("No se pudo agregar el jugador");
        }
    };

    const removePlayer = async (gameId: string, playerId: string) => {
        if (!currentGame) return;

        try {
            const updatedPlayers = currentGame.players.filter(p => p.id !== playerId);
            await updateDoc(doc(db, 'recochos', gameId), {
                players: updatedPlayers
            });
        } catch (err) {
            console.error("Error removing player:", err);
            setError("No se pudo eliminar el jugador");
        }
    };

    const updatePitchPrice = async (gameId: string, price: number) => {
        try {
            await updateDoc(doc(db, 'recochos', gameId), {
                pitchPrice: price
            });
        } catch (err) {
            console.error("Error updating price:", err);
            setError("No se pudo actualizar el precio");
        }
    };

    const deleteGame = async (gameId: string) => {
        try {
            await deleteDoc(doc(db, 'recochos', gameId));
            setCurrentGame(null);
        } catch (err) {
            console.error("Error deleting game:", err);
            setError("No se pudo finalizar el partido");
        }
    };

    return {
        activeGames,
        myGames,
        currentGame,
        loading,
        error,
        createGame,
        joinGame,
        addPlayer,
        removePlayer,
        updatePitchPrice,
        deleteGame,
        setCurrentGame // Exposed to allow clearing current game
    };
}

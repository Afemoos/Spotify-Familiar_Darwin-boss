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
    const [error, setError] = useState<string | null>(null); // Action errors (create, join, etc)
    const [loadingError, setLoadingError] = useState<string | null>(null); // Subscription errors

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
            setLoadingError(null);
        }, (err) => {
            console.error("Error fetching games:", err);
            // Only set loading error if we don't have games yet
            if (activeGames.length === 0) {
                setLoadingError("Error al cargar los partidos activos");
            }
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

    const createGame = async (params: CreateRecochoParams): Promise<{ id: string, adminCode: string } | null> => {
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
            const adminCode = generateCode(); // Generate separate admin code

            const newGame: Omit<RecochoGame, 'id'> = {
                code,
                adminCode,
                recoveryPin: params.recoveryPin,
                createdAt: Date.now(),
                teamSize: params.teamSize,
                pitchPrice: params.pitchPrice,
                players: [],
                createdBy: user ? user.uid : (params.creatorName || 'Guest'),
                status: 'active'
            };

            const docRef = await addDoc(collection(db, 'recochos'), newGame);

            // Save ownership locally for guest users (using ID for persistence)
            localStorage.setItem(`recocho_owner_${docRef.id}`, 'true');

            setCurrentGame({ id: docRef.id, ...newGame } as RecochoGame);
            return { id: docRef.id, adminCode };
        } catch (err) {
            console.error("Error creating game:", err);
            setError("No se pudo crear la sala");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const joinGame = async (code: string): Promise<{ success: boolean, isAdmin: boolean, game?: RecochoGame }> => {
        setLoading(true);
        setError(null);
        try {
            // Check if it's a public code
            let q = query(
                collection(db, 'recochos'),
                where('code', '==', code.toUpperCase()),
                where('status', '==', 'active'),
                limit(1)
            );
            let snapshot = await getDocs(q);
            let isAdmin = false;

            // If not found, check if it's an admin code
            if (snapshot.empty) {
                q = query(
                    collection(db, 'recochos'),
                    where('adminCode', '==', code.toUpperCase()),
                    where('status', '==', 'active'),
                    limit(1)
                );
                snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    isAdmin = true;
                }
            }

            if (snapshot.empty) {
                setError("Sala no encontrada o inactiva");
                return { success: false, isAdmin: false };
            }

            const gameDoc = snapshot.docs[0];
            const gameData = { id: gameDoc.id, ...gameDoc.data() } as RecochoGame;

            // If admin, save local ownership
            if (isAdmin) {
                localStorage.setItem(`recocho_owner_${gameDoc.id}`, 'true');
            }

            setCurrentGame(gameData);
            return { success: true, isAdmin, game: gameData };
        } catch (err) {
            console.error("Error joining game:", err);
            setError("Error al unirse a la sala");
            return { success: false, isAdmin: false };
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = async (gameId: string, name: string, team: 'A' | 'B', phoneNumber?: string, status: 'confirmed' | 'suggested' = 'confirmed') => {
        if (!currentGame) return;

        try {
            const newPlayer: RecochoPlayer = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                isGuest: !user,
                team,
                addedAt: Date.now(),
                phoneNumber,
                status
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
        loadingError,
        createGame,
        joinGame,
        addPlayer,
        removePlayer,
        updatePitchPrice,
        deleteGame,
        setCurrentGame // Exposed to allow clearing current game
    };
}

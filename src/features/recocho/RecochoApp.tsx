import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecocho } from '../../hooks/useRecocho';
import { Landing } from './components/Landing';
import { CreateGame } from './components/CreateGame';
import { GameRoom } from './components/GameRoom';
import { ManageGames } from './components/ManageGames';

interface RecochoAppProps {
    onBackToHub: () => void;
}



export function RecochoApp({ onBackToHub }: RecochoAppProps) {
    const { user } = useAuth();
    const {
        activeGames,
        myGames,
        currentGame,
        createGame,
        joinGame,
        error,
        addPlayer,
        removePlayer,
        updatePitchPrice,
        deleteGame,
        setCurrentGame
    } = useRecocho();

    const [view, setView] = useState<'landing' | 'create' | 'manage' | 'room'>('landing');
    const [isCreating, setIsCreating] = useState(false);
    const [adminGameId, setAdminGameId] = useState<string | null>(null);
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);
    const [adminCode, setAdminCode] = useState('');

    const handleCreateGame = async (teamSize: number, pitchPrice: number) => {
        setIsCreating(true);
        const result = await createGame({ teamSize, pitchPrice });
        setIsCreating(false);

        if (result) {
            setAdminGameId(result.id); // Grant admin rights immediately
            setView('room'); // Go directly to room on create
        }
    };



    // Effect to switch to room view if currentGame is set
    if (currentGame && view !== 'room') {
        setView('room');
    }

    const handleLeaveRoom = () => {
        setCurrentGame(null);
        setView('landing');
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminCode.trim()) return;

        const { success, isAdmin, game } = await joinGame(adminCode);
        if (success && game) {
            if (isAdmin) {
                setAdminGameId(game.id);
            }
            setShowAdminPrompt(false);
            setAdminCode('');
            setView('room');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A1A1A] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Admin Prompt Modal */}
            {showAdminPrompt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A2A2A] border border-white/10 rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-bold text-white mb-2">Administrar Sala</h3>
                        <p className="text-gray-400 mb-6">Ingresa el código de la sala para modificarla</p>

                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={adminCode}
                                onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                                placeholder="CÓDIGO"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500/50 uppercase"
                                autoFocus
                            />
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdminPrompt(false);
                                        setAdminCode('');
                                    }}
                                    className="p-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                                >
                                    Ingresar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="relative z-10 min-h-screen p-4 md:p-6 flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between mb-8 md:mb-12">
                    <button
                        onClick={() => {
                            if (view === 'landing') {
                                onBackToHub();
                            } else {
                                setCurrentGame(null); // Clear current game to prevent auto-redirect
                                setView('landing');
                                setAdminGameId(null); // Clear admin session on back to landing
                            }
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors md:absolute md:top-6 md:left-6"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-2 mx-auto md:mx-0 md:absolute md:top-6 md:left-1/2 md:-translate-x-1/2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="font-bold text-black text-lg">R</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Recocho</span>
                    </div>

                    <div className="w-10 md:hidden" /> {/* Spacer */}
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    {view === 'landing' && (
                        <Landing
                            onCreateClick={() => setView('create')}
                            onManageClick={() => setView('manage')}
                            onJoinClick={() => setView('manage')}
                            onAdminClick={() => setShowAdminPrompt(true)}
                        />
                    )}

                    {view === 'create' && (
                        <CreateGame
                            onCreate={handleCreateGame}
                            onCancel={() => setView('landing')}
                            isCreating={isCreating}
                            error={error}
                        />
                    )}

                    {view === 'manage' && (
                        <ManageGames
                            activeGames={activeGames}
                            myGames={myGames}
                            onBack={() => setView('landing')}
                            onJoinGame={async (code) => {
                                const { success } = await joinGame(code);
                                if (success) setView('room');
                                return success;
                            }}
                        />
                    )}

                    {view === 'room' && currentGame && (
                        <GameRoom
                            game={currentGame}
                            onAddPlayer={(name, team) => addPlayer(currentGame.id, name, team)}
                            onRemovePlayer={(playerId) => removePlayer(currentGame.id, playerId)}
                            onUpdatePrice={(price) => updatePitchPrice(currentGame.id, price)}
                            onDelete={async () => {
                                await deleteGame(currentGame.id);
                                setView('landing');
                            }}
                            onLeave={handleLeaveRoom}
                            isOwner={
                                (user && currentGame.createdBy === user.uid) ||
                                adminGameId === currentGame.id
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Default export for lazy loading
export default RecochoApp;

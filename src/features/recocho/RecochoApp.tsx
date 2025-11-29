import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
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
        updatePlayerStatus,
        updatePitchPrice,
        deleteGame,
        setCurrentGame
    } = useRecocho();

    const [view, setView] = useState<'landing' | 'create' | 'manage' | 'room'>('landing');
    const [isCreating, setIsCreating] = useState(false);
    const [adminGameId, setAdminGameId] = useState<string | null>(null);
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);
    const [adminCode, setAdminCode] = useState('');
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryPublicCode, setRecoveryPublicCode] = useState('');
    const [recoveredAdminCode, setRecoveredAdminCode] = useState<string | null>(null);
    const [recoveryError, setRecoveryError] = useState<string | null>(null);

    const [recoveryPinInput, setRecoveryPinInput] = useState('');

    const handleCreateGame = async (teamSize: number, pitchPrice: number, recoveryPin?: string, location?: string) => {
        setIsCreating(true);
        const result = await createGame({ teamSize, pitchPrice, recoveryPin, location });
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
                        {!showRecovery ? (
                            <>
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
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRecovery(true);
                                            setRecoveryError(null);
                                            setRecoveredAdminCode(null);
                                            setRecoveryPublicCode('');
                                        }}
                                        className="w-full text-center text-sm text-gray-500 hover:text-purple-400 transition-colors mt-4"
                                    >
                                        ¿Olvidaste tu código?
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-white mb-2">Recuperar Código</h3>
                                <p className="text-gray-400 mb-6">Ingresa el código PÚBLICO de la sala para recuperar el de admin.</p>

                                <div className="space-y-4">
                                    {!recoveredAdminCode ? (
                                        <>
                                            <input
                                                type="text"
                                                value={recoveryPublicCode}
                                                onChange={(e) => setRecoveryPublicCode(e.target.value.toUpperCase())}
                                                placeholder="CÓDIGO PÚBLICO"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                                                autoFocus
                                            />
                                            {recoveryError && <p className="text-red-400 text-sm text-center">{recoveryError}</p>}
                                            <button
                                                onClick={() => {
                                                    const game = activeGames.find(g => g.code === recoveryPublicCode);
                                                    if (!game) {
                                                        setRecoveryError("Sala no encontrada");
                                                        return;
                                                    }
                                                    // Check permissions
                                                    const isSuperAdmin = user?.email === 'darwin47@elprivado.app';
                                                    const isCreator = user && game.createdBy === user.uid;
                                                    const isLocalOwner = localStorage.getItem(`recocho_owner_${game.id}`) === 'true';
                                                    const isPinCorrect = game.recoveryPin && game.recoveryPin === recoveryPinInput;

                                                    if (isSuperAdmin || isCreator || isLocalOwner || isPinCorrect) {
                                                        setRecoveredAdminCode(game.adminCode);
                                                        setRecoveryError(null);
                                                    } else if (game.recoveryPin) {
                                                        setRecoveryError("PIN incorrecto o no tienes permisos");
                                                    } else {
                                                        setRecoveryError("Esta sala no tiene PIN de recuperación configurado");
                                                    }
                                                }}
                                                disabled={!recoveryPublicCode.trim()}
                                                className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                                            >
                                                Recuperar
                                            </button>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/10"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-[#1A2A2A] px-2 text-gray-500">O usa tu PIN</span>
                                                </div>
                                            </div>

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                value={recoveryPinInput}
                                                onChange={(e) => setRecoveryPinInput(e.target.value.replace(/\D/g, ''))}
                                                placeholder="PIN (Si lo configuraste)"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        </>
                                    ) : (
                                        <div className="text-center space-y-4 animate-in fade-in zoom-in">
                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                <p className="text-sm text-green-400 mb-1">Tu código de Admin es:</p>
                                                <p className="text-3xl font-mono font-bold text-white tracking-widest select-all">{recoveredAdminCode}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAdminCode(recoveredAdminCode);
                                                    setShowRecovery(false);
                                                    setRecoveredAdminCode(null);
                                                }}
                                                className="w-full p-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium shadow-lg shadow-green-500/20 transition-all"
                                            >
                                                Usar este código
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowRecovery(false)}
                                        className="w-full p-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Volver
                                    </button>
                                </div>
                            </>
                        )}
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

                    {/* DEV ONLY: Delete All Button */}
                    <button
                        onClick={async () => {
                            if (confirm('⚠️ PELIGRO: ¿Estás seguro de que quieres ELIMINAR TODAS las salas activas? Esta acción no se puede deshacer.')) {
                                const deletePromises = activeGames.map(game => deleteGame(game.id));
                                await Promise.all(deletePromises);
                                alert('Todas las salas han sido eliminadas.');
                            }
                        }}
                        className="absolute top-2 right-2 md:top-6 md:right-6 p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 text-xs rounded border border-red-500/20 transition-colors"
                        title="Eliminar todas las salas"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    {view === 'landing' && (
                        <Landing
                            onCreateClick={() => setView('create')}
                            onManageClick={() => setView('manage')}
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
                            onJoinGame={async (code, name, phone) => {
                                const { success, game } = await joinGame(code);
                                if (success && game) {
                                    // Only auto-add if details are provided (new join)
                                    if (name && phone) {
                                        // Auto-assign team (smaller team)
                                        const teamA = game.players.filter(p => p.team === 'A').length;
                                        const teamB = game.players.filter(p => p.team === 'B').length;
                                        const assignedTeam = teamA <= teamB ? 'A' : 'B';

                                        await addPlayer(game.id, name, assignedTeam, phone, 'suggested');
                                    }
                                    setView('room');
                                }
                                return success;
                            }}
                        />
                    )}

                    {view === 'room' && currentGame && (
                        <GameRoom
                            game={currentGame}
                            onAddPlayer={(name, team, phone, status, level) => addPlayer(currentGame.id, name, team, phone, status, level)}
                            onRemovePlayer={(playerId) => removePlayer(currentGame.id, playerId)}
                            onUpdatePlayerStatus={(playerId, status, level) => updatePlayerStatus(currentGame.id, playerId, status, level)}
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

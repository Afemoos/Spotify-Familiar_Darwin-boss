import { useState } from 'react';
import { ArrowLeft, Search, Play } from 'lucide-react';
import { RecochoGame } from '../types';

interface ManageGamesProps {
    activeGames: RecochoGame[];
    myGames: RecochoGame[];
    onJoinGame: (code: string) => Promise<boolean>;
    onBack: () => void;
}

export function ManageGames({ activeGames, myGames, onJoinGame, onBack }: ManageGamesProps) {
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async (code: string) => {
        if (!code.trim()) return;
        setIsJoining(true);
        await onJoinGame(code);
        setIsJoining(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver
            </button>

            <h2 className="text-3xl font-bold text-white mb-8">Administrar Recochos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Join by Code */}
                <div className="space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-blue-400" />
                            Unirse con Código
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="CÓDIGO"
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white uppercase"
                                maxLength={6}
                            />
                            <button
                                onClick={() => handleJoin(joinCode)}
                                disabled={isJoining || joinCode.length < 6}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {isJoining ? '...' : 'Unirse'}
                            </button>
                        </div>
                    </div>

                    {/* My History */}
                    {myGames.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Play className="w-5 h-5 text-purple-400" />
                                Mis Recochos
                            </h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {myGames.map((game) => (
                                    <div key={game.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-400 font-mono font-bold">{game.code}</span>
                                                {game.status !== 'active' && (
                                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Finalizado</span>
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {new Date(game.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {game.status === 'active' && (
                                            <button
                                                onClick={() => handleJoin(game.code)}
                                                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Ver
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Games List */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Play className="w-5 h-5 text-green-400" />
                        Salas Activas ({activeGames.length}/5)
                    </h3>

                    {activeGames.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No hay salas activas</p>
                    ) : (
                        <div className="space-y-3">
                            {activeGames.map((game) => (
                                <div key={game.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                    <div>
                                        <span className="text-green-400 font-mono font-bold mr-3">{game.code}</span>
                                        <span className="text-gray-300 text-sm">{game.teamSize}v{game.teamSize}</span>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(game.code)}
                                        className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Ver
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

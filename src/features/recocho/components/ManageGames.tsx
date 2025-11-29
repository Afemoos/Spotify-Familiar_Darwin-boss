import { useState } from 'react';
import { ArrowLeft, Search, Play } from 'lucide-react';
import { RecochoGame } from '../types';

interface ManageGamesProps {
    activeGames: RecochoGame[];
    myGames: RecochoGame[];
    onJoinGame: (code: string, name: string, phone: string) => Promise<boolean>;
    onBack: () => void;
}

export function ManageGames({ activeGames, myGames, onJoinGame, onBack }: ManageGamesProps) {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState('');
    const [joinName, setJoinName] = useState('');
    const [joinPhone, setJoinPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoinClick = (code: string) => {
        // Check if already in my games
        const isAlreadyJoined = myGames.some(g => g.code === code);
        if (isAlreadyJoined) {
            onJoinGame(code, '', ''); // Quick join without details
            return;
        }

        // Pre-fill from localStorage
        const savedName = localStorage.getItem('recocho_user_name') || '';
        const savedPhone = localStorage.getItem('recocho_user_phone') || '';

        setJoinName(savedName);
        setJoinPhone(savedPhone);
        setSelectedCode(code);
        setShowJoinModal(true);
        setError(null);
    };

    const handleConfirmJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinName.trim() || !joinPhone.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        setIsJoining(true);
        setError(null);
        try {
            const success = await onJoinGame(selectedCode, joinName, joinPhone);
            if (!success) {
                setError('No se pudo unir a la sala. Verifica el código.');
                setIsJoining(false);
            } else {
                // Save details for future use
                localStorage.setItem('recocho_user_name', joinName);
                localStorage.setItem('recocho_user_phone', joinPhone);
            }
            // If success, RecochoApp will switch view
        } catch (err) {
            setError('Ocurrió un error al unirse');
            setIsJoining(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20 relative">
            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A2A2A] border border-white/10 rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-bold text-white mb-2">Unirse a la Sala</h3>
                        <p className="text-gray-400 mb-6">Ingresa tus datos para sugerirte en el partido</p>

                        <form onSubmit={handleConfirmJoin} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold ml-1">Código de Sala</label>
                                <div className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg text-center">
                                    {selectedCode}
                                </div>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    value={joinName}
                                    onChange={(e) => setJoinName(e.target.value)}
                                    placeholder="Tu Nombre"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <input
                                    type="tel"
                                    value={joinPhone}
                                    onChange={(e) => setJoinPhone(e.target.value)}
                                    placeholder="Tu Número de Celular"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowJoinModal(false);
                                        setJoinName('');
                                        setJoinPhone('');
                                        setError(null);
                                    }}
                                    className="p-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isJoining}
                                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50"
                                >
                                    {isJoining ? 'Uniéndome...' : 'Unirse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver
            </button>

            <h2 className="text-3xl font-bold text-white mb-8">Ver recochos activos</h2>

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
                                onClick={() => handleJoinClick(joinCode)}
                                disabled={joinCode.length < 6}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                Unirse
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
                                                onClick={() => handleJoinClick(game.code)}
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
                                        onClick={() => handleJoinClick(game.code)}
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

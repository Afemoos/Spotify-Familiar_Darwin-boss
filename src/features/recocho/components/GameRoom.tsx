import { useState } from 'react';
import { ArrowLeft, Share2, Trash2, Plus, Edit2, Settings, Check, X } from 'lucide-react';
import { RecochoGame } from '../types';

interface GameRoomProps {
    game: RecochoGame;
    onAddPlayer: (name: string, team: 'A' | 'B', phoneNumber?: string, status?: 'confirmed' | 'suggested', level?: number) => Promise<void>;
    onRemovePlayer: (playerId: string) => Promise<void>;
    onUpdatePlayerStatus: (playerId: string, status: 'confirmed' | 'suggested', level?: number) => Promise<void>;
    onUpdatePrice: (price: number) => Promise<void>;
    onDelete: () => Promise<void>;
    onLeave: () => void;
    isOwner: boolean;
}

export function GameRoom({ game, onAddPlayer, onRemovePlayer, onUpdatePlayerStatus, onUpdatePrice, onDelete, onLeave, isOwner }: GameRoomProps) {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // For guests
    const [playerLevel, setPlayerLevel] = useState<number>(5); // Default level
    const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [tempPrice, setTempPrice] = useState(game.pitchPrice.toString());

    // State for editing suggested player level
    const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
    const [tempLevel, setTempLevel] = useState<number>(5);

    const teamA = game.players.filter(p => p.team === 'A');
    const teamB = game.players.filter(p => p.team === 'B');
    const suggestedPlayers = game.players.filter(p => p.status === 'suggested');

    const pricePerTeam = game.pitchPrice / 2;
    const pricePerPlayerA = teamA.length > 0 ? pricePerTeam / teamA.length : 0;
    const pricePerPlayerB = teamB.length > 0 ? pricePerTeam / teamB.length : 0;

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;

        // If guest, require phone number
        if (!isOwner && !phoneNumber.trim()) {
            alert('Debes ingresar tu número de celular para sugerir un jugador');
            return;
        }

        // Check if team is full
        const currentTeamSize = selectedTeam === 'A' ? teamA.length : teamB.length;
        if (currentTeamSize >= game.teamSize) {
            alert('Equipo lleno');
            return;
        }

        await onAddPlayer(
            newPlayerName,
            selectedTeam,
            isOwner ? undefined : phoneNumber,
            isOwner ? 'confirmed' : 'suggested',
            isOwner ? playerLevel : undefined // Guests suggest level via ManageGames, here it's manual add
        );
        setNewPlayerName('');
        setPhoneNumber('');
        setPlayerLevel(5);
    };

    const handlePriceUpdate = async () => {
        const price = parseFloat(tempPrice) || 0;
        await onUpdatePrice(price);
        setIsEditingPrice(false);
    };

    const shareOnWhatsApp = () => {
        const message = `⚽ * Nuevo Recocho *\n\nCódigo de sala: * ${game.code}*\nFormato: ${game.teamSize} vs ${game.teamSize} \n\nÚnete aquí para jugar!`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20">
            {/* Notifications for Admin */}
            {isOwner && suggestedPlayers.length > 0 && (
                <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 animate-in fade-in slide-in-from-top-5">
                    <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                            <Settings className="w-5 h-5" />
                        </div>
                        Solicitudes Pendientes ({suggestedPlayers.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestedPlayers.map(player => (
                            <div key={player.id} className="bg-black/40 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{player.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${player.team === 'A' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
                                            Equipo {player.team}
                                        </span>
                                    </div>
                                    {player.phoneNumber && (
                                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                            📱 {player.phoneNumber}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-500 uppercase font-bold">Nivel:</span>
                                        {editingLevelId === player.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={tempLevel}
                                                    onChange={(e) => setTempLevel(parseInt(e.target.value))}
                                                    className="w-12 bg-black/40 border border-white/20 rounded px-1 text-center text-sm"
                                                />
                                                <button onClick={() => setEditingLevelId(null)} className="text-xs text-blue-400">OK</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingLevelId(player.id);
                                                    setTempLevel(player.level || 5);
                                                }}
                                                className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-2 rounded border border-yellow-500/20 hover:bg-yellow-500/20"
                                            >
                                                {player.level || '?'} ⭐
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const finalLevel = editingLevelId === player.id ? tempLevel : (player.level || 5);
                                            onUpdatePlayerStatus(player.id, 'confirmed', finalLevel);
                                            setEditingLevelId(null);
                                        }}
                                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                        title="Aceptar"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onRemovePlayer(player.id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                        title="Rechazar"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-6 mb-8 bg-white/5 p-4 md:p-6 rounded-3xl border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onLeave} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Sala de Juego</h2>
                            <div className="flex items-center gap-2 text-green-400 font-mono font-bold text-lg md:text-xl">
                                <span>Código:</span>
                                <span className="bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30 select-all">
                                    {game.code}
                                </span>
                            </div>
                            {game.location && (
                                <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                                    <span>📍 {game.location}</span>
                                </div>
                            )}
                            {isOwner && (
                                <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <span className="text-red-400 text-xs uppercase tracking-widest font-bold flex items-center gap-1">
                                        <Settings className="w-3 h-3" />
                                        Admin:
                                    </span>
                                    <span className="font-mono font-bold text-red-400 select-all text-sm bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                        {game.adminCode}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                        <div className="text-right">
                            <p className="text-xs md:text-sm text-gray-400">Precio Cancha</p>
                            {isEditingPrice ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={tempPrice}
                                        onChange={(e) => setTempPrice(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handlePriceUpdate();
                                            if (e.key === 'Escape') setIsEditingPrice(false);
                                        }}
                                        className="w-24 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-white text-right"
                                        autoFocus
                                    />
                                    <button onClick={handlePriceUpdate} className="p-1 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors" title="Guardar">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setIsEditingPrice(false)} className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="Cancelar">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => isOwner && setIsEditingPrice(true)}
                                    className={`flex items-center gap-2 text-xl md:text-2xl font-bold transition-colors ${isOwner ? 'hover:text-green-400 cursor-pointer' : 'cursor-default'} ${game.pitchPrice === 0 ? 'text-yellow-400' : 'text-white'}`}
                                >
                                    {game.pitchPrice === 0 ? 'Por definir' : `$${game.pitchPrice.toLocaleString()}`}
                                    {isOwner && <Edit2 className="w-4 h-4 opacity-50" />}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={shareOnWhatsApp}
                                className="p-3 bg-green-600 hover:bg-green-500 rounded-xl text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                                title="Compartir en WhatsApp"
                            >
                                <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de finalizar este partido? Se eliminará la sala.')) {
                                            onDelete();
                                        }
                                    }}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-all hover:scale-105"
                                    title="Finalizar Partido"
                                >
                                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team A */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-6 bg-gradient-to-b from-blue-600/20 to-transparent border-b border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-blue-400">Equipo A</h3>
                            <span className="text-sm bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-500/30 text-blue-300">
                                {teamA.length} / {game.teamSize}
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-400">Total Equipo</p>
                                <p className="text-lg font-bold text-white">${pricePerTeam.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Por Jugador</p>
                                <p className="text-xl font-bold text-blue-400">${Math.ceil(pricePerPlayerA).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-2">
                        {teamA.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{player.name}</span>
                                        {player.level && (
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/30 font-bold">
                                                ★ {player.level}
                                            </span>
                                        )}
                                        {player.status === 'suggested' && (
                                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase tracking-wide">
                                                Sugerido
                                            </span>
                                        )}
                                    </div>
                                    {isOwner && player.phoneNumber && (
                                        <span className="text-xs text-gray-500">{player.phoneNumber}</span>
                                    )}
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={() => onRemovePlayer(player.id)}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {teamA.length < game.teamSize && (
                            <button
                                onClick={() => setSelectedTeam('A')}
                                className={`w-full p-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 ${selectedTeam === 'A' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : ''}`}
                            >
                                <Plus className="w-4 h-4" /> Agregar Jugador
                            </button>
                        )}
                    </div>
                </div>

                {/* Team B */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-6 bg-gradient-to-b from-red-600/20 to-transparent border-b border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-red-400">Equipo B</h3>
                            <span className="text-sm bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30 text-red-300">
                                {teamB.length} / {game.teamSize}
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-400">Total Equipo</p>
                                <p className="text-lg font-bold text-white">${pricePerTeam.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Por Jugador</p>
                                <p className="text-xl font-bold text-red-400">${Math.ceil(pricePerPlayerB).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-2">
                        {teamB.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{player.name}</span>
                                        {player.level && (
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/30 font-bold">
                                                ★ {player.level}
                                            </span>
                                        )}
                                        {player.status === 'suggested' && (
                                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase tracking-wide">
                                                Sugerido
                                            </span>
                                        )}
                                    </div>
                                    {isOwner && player.phoneNumber && (
                                        <span className="text-xs text-gray-500">{player.phoneNumber}</span>
                                    )}
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={() => onRemovePlayer(player.id)}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {teamB.length < game.teamSize && (
                            <button
                                onClick={() => setSelectedTeam('B')}
                                className={`w-full p-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 ${selectedTeam === 'B' ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''}`}
                            >
                                <Plus className="w-4 h-4" /> Agregar Jugador
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Player Input (Sticky Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 md:pb-4 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 z-20 safe-area-bottom">
                <form onSubmit={handleAddPlayer} className="max-w-md mx-auto flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder={`Jugador para Equipo ${selectedTeam}`}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 text-base"
                        />
                        <button
                            type="submit"
                            disabled={!newPlayerName.trim() || (!isOwner && !phoneNumber.trim())}
                            className={`px-4 md:px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 ${isOwner ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            <Plus className="w-6 h-6" />
                            <span className="hidden md:inline">{isOwner ? 'Agregar' : 'Sugerir'}</span>
                        </button>
                    </div>

                    {isOwner ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-sm text-gray-400">Nivel:</span>
                            <div className="flex gap-1 overflow-x-auto pb-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setPlayerLevel(lvl)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold flex-shrink-0 transition-all ${playerLevel === lvl
                                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-105'
                                            : 'bg-black/40 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Número de celular (Requerido para sugerir)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-base animate-in fade-in slide-in-from-bottom-2"
                        />
                    )}
                </form>
            </div>
        </div>
    );
}

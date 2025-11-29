import { useState } from 'react';
import { Users, DollarSign, Loader2 } from 'lucide-react';

interface CreateGameProps {
    onCreate: (teamSize: number, pitchPrice: number) => Promise<void>;
    onCancel: () => void;
    isCreating: boolean;
    error?: string | null;
}

export function CreateGame({ onCreate, onCancel, isCreating, error }: CreateGameProps) {
    const [teamSize, setTeamSize] = useState<number>(5);
    const [pitchPrice, setPitchPrice] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(pitchPrice) || 0;
        await onCreate(teamSize, price);
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Configurar Recocho</h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Jugadores por equipo
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {[5, 6, 7, 8, 9, 10, 11].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setTeamSize(size)}
                                    className={`p-3 rounded-xl font-bold transition-all ${teamSize === size
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/20 scale-105'
                                        : 'bg-black/20 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {size}v{size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Precio de la cancha
                        </label>
                        <input
                            type="number"
                            value={pitchPrice}
                            onChange={(e) => setPitchPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            min="0"
                        />
                        <p className="text-xs text-gray-400">Deja en 0 si aún no conoces el precio</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            {isCreating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Crear Sala'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

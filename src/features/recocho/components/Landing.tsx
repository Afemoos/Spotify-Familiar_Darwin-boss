import { Plus, Users, Settings } from 'lucide-react';

interface LandingProps {
    onCreateClick: () => void;
    onManageClick: () => void;
    onAdminClick: () => void;
}

export function Landing({ onCreateClick, onManageClick, onAdminClick }: LandingProps) {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                    Recocho
                </h1>
                <p className="text-xl text-gray-300">
                    Organiza tus partidos de fútbol fácil y rápido
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                <button
                    onClick={onCreateClick}
                    className="group relative flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-green-600/20 border border-white/10 hover:border-green-500/50 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                        <Plus className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Crear Sala</h3>
                    <p className="text-gray-400 text-center text-sm">
                        Crea un nuevo partido y comparte el código
                    </p>
                </button>

                <button
                    onClick={onManageClick}
                    className="group relative flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ver recochos activos</h3>
                    <p className="text-gray-400 text-center text-sm">
                        Ver tus partidos activos y el historial
                    </p>
                </button>

                {/* Admin Button */}
                <button
                    onClick={onAdminClick}
                    className="group relative flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                        <Settings className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Administrar Recochos</h3>
                    <p className="text-gray-400 text-center text-sm">
                        Ingresa con el código para modificar tu sala
                    </p>
                </button>
            </div>
        </div>
    );
}

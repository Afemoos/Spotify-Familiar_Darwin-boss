

import { apps } from '../config/apps';

interface HubProps {
    onSelectApp: (appId: string) => void;
}

export function Hub({ onSelectApp }: HubProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6 font-sans text-white">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Bienvenido
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl">
                        Selecciona una aplicación para comenzar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => onSelectApp(app.id)}
                            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 text-left flex flex-col gap-6 animate-in zoom-in-95 duration-500 delay-100"
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-green-500/30 group-hover:border-green-500/50 transition-all shadow-lg shadow-black/50">
                                <img
                                    src={app.icon}
                                    alt={app.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{app.name}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {app.description}
                                </p>
                            </div>
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}

                    {/* Placeholder for future apps */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 opacity-50 border-dashed">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-2xl text-gray-600">+</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Próximamente</p>
                    </div>
                </div>
            </div>

            <footer className="fixed bottom-6 text-center text-gray-600 text-xs">
                &copy; {new Date().getFullYear()} Darwin's Suite
            </footer>
        </div>
    );
}

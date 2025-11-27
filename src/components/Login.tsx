import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, AlertCircle, UserCheck, X, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Member, PaymentData } from '../types';

interface LoginProps {
    onLoginSuccess: () => void;
    onGuestLogin: () => void;
    onBackToHub?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGuestLogin, members, payments, onBackToHub }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [showMemberSelection, setShowMemberSelection] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ type: 'success' | 'warning' | null, message: string }>({ type: null, message: '' });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Darwin47' && password === 'Darwin47') {
            setError(false);
            onLoginSuccess();
        } else {
            setError(true);
        }
    };

    const handleRetry = () => {
        setError(false);
        setUsername('');
        setPassword('');
    };

    const handleGuestClick = () => {
        setShowMemberSelection(true);
    };

    const handleMemberSelect = (memberId: string) => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const key = `${memberId}_${year}-${month}`;

        const isPaid = !!payments[key];

        if (isPaid) {
            setModalConfig({
                type: 'success',
                message: '¡Felicitaciones! Estás al día con tu obligación'
            });
        } else {
            setModalConfig({
                type: 'warning',
                message: '¡OJO! Parece que sos mala paga. Ten cuidado o serás reportado ante las centrales de riesgo.'
            });
        }
    };

    const handleModalClose = () => {
        setModalConfig({ type: null, message: '' });
        onGuestLogin();
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Acceso denegado</h2>
                    <p className="text-gray-300 mb-8">
                        Lo sentimos, pero parece que no tienes acceso. Por favor verifica tus credenciales.
                    </p>
                    <button
                        onClick={handleRetry}
                        className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    if (modalConfig.type) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 z-50">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in duration-300 relative">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${modalConfig.type === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                        {modalConfig.type === 'success' ? (
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-10 h-10 text-yellow-500" />
                        )}
                    </div>
                    <h2 className={`text-2xl font-bold mb-4 ${modalConfig.type === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {modalConfig.type === 'success' ? '¡Excelente!' : '¡Atención!'}
                    </h2>
                    <p className="text-white text-lg mb-8 leading-relaxed">
                        {modalConfig.message}
                    </p>
                    <button
                        onClick={handleModalClose}
                        className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (showMemberSelection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">¿Quién eres?</h2>
                        <button onClick={() => setShowMemberSelection(false)} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-gray-300 mb-6">Selecciona tu nombre para continuar.</p>
                    <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {members.map((member: Member) => (
                            <button
                                key={member.id}
                                onClick={() => handleMemberSelect(member.id)}
                                className="w-full bg-gray-800/50 hover:bg-green-600/20 border border-gray-700 hover:border-green-500/50 text-white font-medium py-4 px-4 rounded-xl transition-all duration-200 text-left flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                    <User className="w-5 h-5 text-gray-300 group-hover:text-green-400" />
                                </div>
                                <span className="text-lg">{member.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative">
            <button
                onClick={onBackToHub}
                className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors group"
            >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-medium">Volver al inicio</span>
            </button>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
                    <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
                    <p className="text-gray-400">Ingresa tus credenciales para continuar</p>
                </div>

                {onBackToHub && (
                    <button
                        onClick={onBackToHub}
                        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" /> Volver
                    </button>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Usuario</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                                placeholder="Ingresa tu usuario"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group"
                        >
                            <span>Ingresar</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">O</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGuestClick}
                            className="w-full bg-gray-700/50 text-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-500"
                        >
                            <UserCheck className="w-5 h-5" />
                            <span>Entrar como visitante</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

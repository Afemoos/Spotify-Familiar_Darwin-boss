import { useState } from 'react';
import { User, Lock, ArrowLeft, Users, CheckCircle, AlertTriangle, Eye, EyeOff, X } from 'lucide-react';
import { Member, PaymentData } from '../types';

interface LoginProps {
    onLoginSuccess: () => void;
    onGuestLogin: () => void;
    onBackToHub: () => void;
    members: Member[];
    payments: Record<string, PaymentData>;
    onRequestSpot: (name: string) => Promise<void>;
}

export function Login({ onLoginSuccess, onGuestLogin, onBackToHub, members, payments, onRequestSpot }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showMemberSelection, setShowMemberSelection] = useState(false);
    const [showStatusMessage, setShowStatusMessage] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isGoodStanding, setIsGoodStanding] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Darwin47' && password === 'Darwin47') {
            onLoginSuccess();
        } else {
            setError('Credenciales incorrectas');
        }
    };

    const handleGuestClick = () => {
        setShowMemberSelection(true);
    };

    const handleMemberSelect = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        if (member) {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const key = `${memberId}_${year}-${month}`;
            const payment = payments[key];
            const isPaid = !!payment;

            setIsGoodStanding(isPaid);
            setStatusMessage(isPaid
                ? "Felicitaciones, estas al dia con tu obligacion"
                : "OJO, Parece que sos un malapaga. Ten cautela o seras reportado ante las centrales de riesgo"
            );
            setShowStatusMessage(true);
        }
    };

    const handleStatusMessageClose = () => {
        setShowStatusMessage(false);
        setShowMemberSelection(false);
        onGuestLogin();
    };

    const handleRequestSpot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestName.trim()) return;

        setRequestStatus('submitting');
        try {
            await onRequestSpot(requestName);
            setRequestStatus('success');
            setTimeout(() => {
                setShowRequestModal(false);
                setRequestStatus('idle');
                setRequestName('');
            }, 2000);
        } catch (error) {
            console.error("Error requesting spot:", error);
            setRequestStatus('idle');
        }
    };

    if (showRequestModal) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-700 relative">
                    <button
                        onClick={() => setShowRequestModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {requestStatus === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¡Solicitud Enviada!</h3>
                            <p className="text-gray-400">El administrador revisará tu solicitud pronto.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">Solicitar Cupo</h2>
                            <form onSubmit={handleRequestSpot} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        ¿Cuál es tu nombre?
                                    </label>
                                    <input
                                        type="text"
                                        value={requestName}
                                        onChange={(e) => setRequestName(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Tu nombre completo"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!requestName.trim() || requestStatus === 'submitting'}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {requestStatus === 'submitting' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Enviar Solicitud'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (showStatusMessage) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className={`bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border ${isGoodStanding ? 'border-green-500/50' : 'border-red-500/50'} text-center`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isGoodStanding ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {isGoodStanding ? (
                            <CheckCircle className="w-10 h-10" />
                        ) : (
                            <AlertTriangle className="w-10 h-10" />
                        )}
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${isGoodStanding ? 'text-green-400' : 'text-red-400'}`}>
                        {isGoodStanding ? '¡Excelente!' : '¡Atención!'}
                    </h3>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        {statusMessage}
                    </p>
                    <button
                        onClick={handleStatusMessageClose}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${isGoodStanding
                            ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20'
                            : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20'
                            }`}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        );
    }

    if (showMemberSelection) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => setShowMemberSelection(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-white">¿Quién eres?</h2>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => handleMemberSelect(member.id)}
                                className="w-full p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-gray-200 font-medium group-hover:text-white">{member.name}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center group-hover:bg-gray-500 transition-colors">
                                    <User className="w-4 h-4 text-gray-300" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-700">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-8">Spotify Familiar</h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Ingresa tu usuario"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-12 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-green-900/20"
                    >
                        Iniciar Sesión
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800 text-gray-500">O continúa como</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleGuestClick}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 border border-gray-600"
                        >
                            Entrar como Visitante
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowRequestModal(true)}
                            className="w-full bg-transparent hover:bg-gray-700/50 text-green-400 font-medium py-2 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Solicitar Cupo
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                    <button
                        onClick={onBackToHub}
                        className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Hub
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Lock, Loader2, ArrowLeft, Users } from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../../../config/firebase';
import { Member } from '../../../types';

interface RegisterProps {
    onNavigate: (page: 'login' | 'register' | 'forgot-password' | 'hub') => void;
}

export function Register({ onNavigate }: RegisterProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signUp, error, loading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const membersRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members');
                const snapshot = await getDocs(membersRef);
                const loadedMembers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Member[];
                // Filter out members that are already linked to a user
                const availableMembers = loadedMembers.filter(m => !m.userId);
                setMembers(availableMembers.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Error fetching members:", error);
                setLocalError("Error al cargar la lista de miembros");
            } finally {
                setIsLoadingMembers(false);
            }
        };
        fetchMembers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (password !== confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }

        if (!selectedMemberId) {
            setLocalError('Por favor selecciona quién eres');
            return;
        }

        setIsSubmitting(true);
        try {
            let registerEmail = email;
            if (!email.includes('@')) {
                registerEmail = `${email}@elprivado.app`;
            }
            await signUp(registerEmail, password);

            // Link user to member
            const memberRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members', selectedMemberId);
            // We need the current user ID, but signUp doesn't return it directly in the context interface used here.
            // However, useAuth updates the user state. But that might be async.
            // A safer way is to wait for auth state change or assume success means current auth.currentUser is set.
            // Let's rely on the fact that signUp in AuthContext waits for createUserWithEmailAndPassword which signs in the user.

            // We need to get the user ID. Since we are inside the component, we can't easily get the ID from the signUp promise if it returns void.
            // But firebase auth automatically signs in.
            // Let's wait a brief moment or check auth.currentUser directly from import if needed, but better to use the context if possible.
            // Actually, let's modify the AuthContext to return the UserCredential or User object, OR just use the auth instance directly here for the ID.

            // Re-reading AuthContext: signUp returns Promise<void>.
            // But it calls createUserWithEmailAndPassword.
            // We can import 'auth' from firebase config to get the current user immediately after success.
            const { auth } = await import('../../../config/firebase');
            if (auth.currentUser) {
                await updateDoc(memberRef, {
                    userId: auth.currentUser.uid
                });
            }

            onNavigate('hub');
        } catch (error) {
            // Error is handled in context
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6 font-sans text-white">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <button
                    onClick={() => onNavigate('hub')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al Hub
                </button>

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Crear Cuenta
                    </h2>
                    <p className="text-gray-400">
                        Únete a El Privado Apps
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {(error || localError) && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
                                {localError || error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">¿Quién eres?</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <select
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all appearance-none"
                                    required
                                    disabled={isLoadingMembers}
                                >
                                    <option value="" className="bg-gray-900 text-gray-400">Selecciona tu nombre...</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id} className="bg-gray-900 text-white">
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingMembers && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 ml-1">
                                Selecciona tu nombre de la lista de miembros autorizados.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email o Usuario</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                                    placeholder="tu@email.com o usuario"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Registrarse'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿Ya tienes una cuenta?{' '}
                            <button
                                onClick={() => onNavigate('login')}
                                className="text-green-400 hover:text-green-300 font-medium transition-colors"
                            >
                                Inicia Sesión
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Member, PaymentData } from '../../../types';

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onLogout: () => void;
    members: Member[];
    payments: Record<string, PaymentData>;
}

export function UserInfoModal({ isOpen, onClose, user, onLogout, members, payments }: UserInfoModalProps) {
    const [todaysRoutine, setTodaysRoutine] = useState<string[] | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setLoadingInfo(true);
            const fetchGymData = async () => {
                try {
                    const docRef = doc(db, 'gym_routines', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const schedule = docSnap.data().schedule;
                        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                        const today = days[new Date().getDay()];
                        setTodaysRoutine(schedule[today] || null);
                    } else {
                        setTodaysRoutine(null);
                    }
                } catch (error) {
                    console.error("Error fetching gym routine:", error);
                } finally {
                    setLoadingInfo(false);
                }
            };
            fetchGymData();
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const getSpotifyStatus = () => {
        if (!user) return null;
        // Try to find member by userId first, then by name
        const member = members.find(m => m.userId === user.uid) ||
            members.find(m => m.name.toLowerCase() === (user.displayName || user.email?.split('@')[0])?.toLowerCase());
        if (!member) return { status: 'unknown', message: 'No vinculado' };

        if (member.isExempt) {
            return {
                status: 'vip',
                message: 'VIP'
            };
        }

        const date = new Date();
        const key = `${member.id}_${date.getFullYear()}-${date.getMonth() + 1}`;
        const isPaid = !!payments[key];

        return {
            status: isPaid ? 'paid' : 'pending',
            message: isPaid ? 'Pagado' : 'Pendiente'
        };
    };

    const spotifyStatus = getSpotifyStatus();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-4">
                        <span className="font-bold text-white text-3xl">
                            {user.email?.[0].toUpperCase()}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white capitalize">{user.displayName || user.email?.split('@')[0]}</h2>
                    <p className="text-sm text-gray-400">{user.email}</p>
                </div>

                <div className="space-y-4">
                    {/* Spotify Status */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Spotify Familiar
                            </h3>
                            {spotifyStatus?.status === 'vip' ? (
                                <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg border border-yellow-500/20">
                                    VIP
                                </span>
                            ) : spotifyStatus?.status === 'paid' ? (
                                <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-lg border border-green-500/20">
                                    AL DÍA
                                </span>
                            ) : (
                                <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded-lg border border-red-500/20">
                                    PENDIENTE
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Estado del mes actual
                        </p>
                    </div>

                    {/* Gym Routine */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Gym - Hoy
                            </h3>
                        </div>
                        {loadingInfo ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : todaysRoutine && todaysRoutine.length > 0 ? (
                            <ul className="space-y-2">
                                {todaysRoutine.map((exercise, idx) => (
                                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        {exercise}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center py-2">
                                Descanso o sin rutina asignada
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            onLogout();
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-colors font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}

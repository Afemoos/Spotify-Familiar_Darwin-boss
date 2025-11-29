

import { useState, useEffect } from 'react';
import { apps } from '../../config/apps';
import { useAuth } from '../../context/AuthContext';
import { useSpotifyData } from '../../hooks/useSpotifyData';
import { VisitorRequest } from '../spotify/components/VisitorRequest';
import { MigrationTool } from '../spotify/components/MigrationTool';
import { useGroups } from '../../context/GroupContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LogOut, LogIn, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface LobbyProps {
    onSelectApp: (appId: string) => void;
    onNavigateToAuth: () => void;
}

export function Lobby({ onSelectApp, onNavigateToAuth }: LobbyProps) {
    const { user, logOut } = useAuth();
    const [showInfoModal, setShowInfoModal] = useState(false);
    const { groups, currentGroup, selectGroup, createGroup, joinGroupByCode, loadGroupForVisitor } = useGroups();
    const { members, payments, requestSpot } = useSpotifyData(currentGroup?.id);
    const [todaysRoutine, setTodaysRoutine] = useState<string[] | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [visitorCode, setVisitorCode] = useState('');
    const [loadingVisitor, setLoadingVisitor] = useState(false);


    const handleAppClick = (appId: string) => {
        onSelectApp(appId);
    };

    useEffect(() => {
        if (showInfoModal && user) {
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
    }, [showInfoModal, user]);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col font-sans text-white relative overflow-hidden">
            {/* Header with Auth Button */}
            <div className="w-full flex justify-end p-6 z-20 relative">
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <div
                                onClick={() => setShowInfoModal(true)}
                                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 pr-4 animate-in fade-in slide-in-from-top-5 duration-500 hover:bg-white/10 transition-colors hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                    <span className="font-bold text-white text-lg">
                                        {user.email?.[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left mr-2">
                                    <p className="text-xs text-gray-400">Hola,</p>
                                    <p className="text-sm font-medium text-white max-w-[150px] truncate capitalize">
                                        {user.displayName || user.email?.split('@')[0]}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => logOut()}
                                className="p-3 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-2xl transition-all text-gray-400 hover:text-red-400 shadow-lg"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <Button
                            onClick={onNavigateToAuth}
                            variant="ghost"
                            color="indigo"
                            icon={<LogIn className="w-4 h-4" />}
                        >
                            Iniciar Sesión
                        </Button>
                    )}
                </div>
            </div>

            {/* User Info Modal */}
            {showInfoModal && user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInfoModal(false)}>
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowInfoModal(false)}
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
                                    logOut();
                                    setShowInfoModal(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-colors font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Visitor Request for unlinked users */}
            {user && !spotifyStatus && !currentGroup && (
                <div className="w-full max-w-md mx-auto px-6 mt-8 z-20 relative space-y-8">
                    <VisitorRequest onRequestSpot={requestSpot} />

                    {/* Visitor Code Access */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 text-center">¿Tienes un código de invitado?</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Código (ej. ABC123)"
                                value={visitorCode}
                                onChange={(e) => setVisitorCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white uppercase text-center"
                                maxLength={6}
                            />
                            <button
                                onClick={async () => {
                                    if (visitorCode.length < 6) return;
                                    setLoadingVisitor(true);
                                    const success = await loadGroupForVisitor(visitorCode);
                                    if (!success) {
                                        alert("Código no encontrado");
                                    }
                                    setLoadingVisitor(false);
                                }}
                                disabled={loadingVisitor || visitorCode.length < 6}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {loadingVisitor ? '...' : 'Ver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Migration Tool for Darwin */}
            <MigrationTool />

            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-12 pb-20">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {currentGroup ? currentGroup.name : 'Lobby'}
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl">
                        {currentGroup ? 'Selecciona una aplicación' : 'Bienvenido a El Privado Apps'}
                    </p>
                </div>

                {/* Group Selection / Creation */}
                {user && !currentGroup && (
                    <div className="w-full max-w-2xl mx-auto space-y-8">
                        {/* Create Group */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Crear Nuevo Grupo</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre del grupo (ej. Familia Perez)"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white"
                                />
                                <button
                                    onClick={async () => {
                                        if (!newGroupName.trim()) return;
                                        setIsCreatingGroup(true);
                                        await createGroup(newGroupName);
                                        setNewGroupName('');
                                        setIsCreatingGroup(false);
                                    }}
                                    disabled={isCreatingGroup || !newGroupName.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {isCreatingGroup ? 'Creando...' : 'Crear'}
                                </button>
                            </div>
                        </div>

                        {/* Join by Code */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Unirse con Código</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Código de invitación (ej. ABC123)"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white uppercase"
                                    maxLength={6}
                                />
                                <button
                                    onClick={async () => {
                                        if (!joinCode.trim()) return;
                                        setIsJoining(true);
                                        const success = await joinGroupByCode(joinCode);
                                        if (success) {
                                            setJoinCode('');
                                            // Optional: Show success message
                                        }
                                        setIsJoining(false);
                                    }}
                                    disabled={isJoining || joinCode.length < 6}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {isJoining ? 'Uniéndose...' : 'Unirse'}
                                </button>
                            </div>
                        </div>

                        {/* My Groups */}
                        {groups.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">Mis Grupos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groups.map(group => (
                                        <div
                                            key={group.id}
                                            onClick={() => selectGroup(group)}
                                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 cursor-pointer transition-all group"
                                        >
                                            <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{group.name}</h4>
                                            <p className="text-gray-400 text-sm">Creado el {new Date(group.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* App Grid - Only show if group selected OR user is visitor (no auth) */}
                {(!user || currentGroup) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.filter(app => !app.hidden).map((app) => (
                            <Card
                                key={app.id}
                                onClick={() => handleAppClick(app.id)}
                                hoverEffect
                                color="indigo"
                                className="group relative cursor-pointer flex flex-col gap-6 animate-in zoom-in-95 duration-500 delay-100 text-left"
                            >
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-indigo-500/30 group-hover:border-indigo-500/50 transition-all shadow-lg shadow-black/50 flex items-center justify-center bg-slate-800">
                                    <app.icon className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{app.name}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {app.description}
                                    </p>
                                </div>
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Card>
                        ))}

                        {/* Placeholder for future apps */}
                        <Card className="flex flex-col items-center justify-center gap-4 opacity-50 border-dashed hover:opacity-75 transition-opacity duration-300 animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <span className="text-2xl text-gray-600">+</span>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">Próximamente</p>
                        </Card>
                    </div>
                )}
            </div>

            <footer className="w-full text-center text-gray-600 text-xs py-6">
                &copy; {new Date().getFullYear()} El Privado Team
            </footer>
        </div >
    );
}

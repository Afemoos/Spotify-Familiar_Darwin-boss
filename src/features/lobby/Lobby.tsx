import { useState } from 'react';
import { apps } from '../../config/apps';
import { useAuth } from '../../context/AuthContext';
import { useSpotifyData } from '../../hooks/useSpotifyData';
import { useGroups } from '../../context/GroupContext';
import { LogOut, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { VisitorPrompt } from './components/VisitorPrompt';
import { UserInfoModal } from './components/UserInfoModal';
import { GroupList } from './components/GroupList';

interface LobbyProps {
    onSelectApp: (appId: string) => void;
    onNavigateToAuth: () => void;
}

export function Lobby({ onSelectApp, onNavigateToAuth }: LobbyProps) {
    const { user, logOut } = useAuth();
    const [showInfoModal, setShowInfoModal] = useState(false);
    const { groups, currentGroup, selectGroup, createGroup, joinGroupByCode, loadGroupForVisitor } = useGroups();
    const { members, payments } = useSpotifyData(currentGroup?.id);

    const [newGroupName, setNewGroupName] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [showVisitorPrompt, setShowVisitorPrompt] = useState(false);

    const handleAppClick = (appId: string) => {
        // Recocho is a public app, allow access without auth/group
        if (appId === 'recocho') {
            onSelectApp(appId);
            return;
        }

        if (!user && !currentGroup) {
            setShowVisitorPrompt(true);
            return;
        }
        onSelectApp(appId);
    };

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

            {/* Visitor Code Prompt Modal */}
            <VisitorPrompt
                isOpen={showVisitorPrompt}
                onClose={() => setShowVisitorPrompt(false)}
                onLoadGroup={loadGroupForVisitor}
                onSuccess={() => onSelectApp('spotify-familiar')}
            />

            {/* User Info Modal */}
            {user && (
                <UserInfoModal
                    isOpen={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                    user={user}
                    onLogout={logOut}
                    members={members}
                    payments={payments}
                />
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-12 pb-20">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {currentGroup ? currentGroup.name : 'Lobby'}
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl">
                        {currentGroup ? 'Selecciona una aplicación' : 'Bienvenido a El Privado Apps'}
                    </p>
                    {/* Visitor Exit Button */}
                    {!user && currentGroup && (
                        <button
                            onClick={() => selectGroup(null)}
                            className="text-sm text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
                        >
                            Salir / Cambiar Grupo
                        </button>
                    )}
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
                        <GroupList groups={groups} onSelectGroup={selectGroup} />
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

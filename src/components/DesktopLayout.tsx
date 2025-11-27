import { Users, DollarSign, List } from 'lucide-react';
import { Header } from './Header';
import { MemberManagement } from './MemberManagement';
import { PaymentList } from './PaymentList';
import { HistoryReport } from './HistoryReport';
import { WhatsAppButton } from './WhatsAppButton';
import { Member, PaymentData } from '../types';

interface DesktopLayoutProps {
    user: any;
    members: Member[];
    payments: Record<string, PaymentData>;
    activeTab: number;
    setActiveTab: (tab: number) => void;
    currentDate: Date;
    changeMonth: (offset: number) => void;
    selectSpecificMonth: (index: number) => void;
    addMember: (name: string) => Promise<void>;
    removeMember: (id: string) => Promise<void>;
    markAsPaid: (member: Member, key: string) => Promise<void>;
    undoPayment: (key: string) => Promise<void>;
    deleteHistorical: (key: string) => Promise<void>;
    isGuest: boolean;
    onLogout: () => void;
}

export function DesktopLayout({
    user,
    members,
    payments,
    activeTab,
    setActiveTab,
    currentDate,
    changeMonth,
    selectSpecificMonth,
    addMember,
    removeMember,
    markAsPaid,
    undoPayment,
    deleteHistorical,
    isGuest,
    onLogout
}: DesktopLayoutProps) {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900/90 backdrop-blur-xl border-r border-white/10 flex flex-col shrink-0 z-20">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <span className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </span>
                        Spotify
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {!isGuest && (
                        <button
                            onClick={() => setActiveTab(0)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === 0 ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Gestión de Familia</span>
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab(1)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === 1 ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">Pagos del Mes</span>
                    </button>
                    <button
                        onClick={() => setActiveTab(2)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === 2 ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                        <List className="w-5 h-5" />
                        <span className="font-medium">Historial de Pagos</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-gray-400 mb-1">Usuario</p>
                        <p className="font-medium text-white truncate">{user?.email || (isGuest ? 'Visitante' : 'Admin')}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <Header user={user} onLogout={onLogout} />

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        {activeTab === 0 && !isGuest && (
                            <div className="max-w-2xl">
                                <MemberManagement
                                    members={members}
                                    onAddMember={addMember}
                                    onRemoveMember={removeMember}
                                />
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-2">
                                    <PaymentList
                                        members={members}
                                        payments={payments}
                                        currentDate={currentDate}
                                        onChangeMonth={changeMonth}
                                        onMarkAsPaid={markAsPaid}
                                        onUndoPayment={undoPayment}
                                        isGuest={isGuest}
                                    />
                                </div>
                                {!isGuest && (
                                    <div className="lg:col-span-1 sticky top-8">
                                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Users className="w-5 h-5 text-green-400" /> Resumen
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                    <span className="text-gray-400">Total Miembros</span>
                                                    <span className="font-bold text-white text-xl">{members.length}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                                    <span className="text-green-400">Pagados</span>
                                                    <span className="font-bold text-green-400 text-xl">
                                                        {members.filter(m => {
                                                            const month = currentDate.getMonth() + 1;
                                                            const year = currentDate.getFullYear();
                                                            const key = `${m.id}_${year}-${month}`;
                                                            return !!payments[key];
                                                        }).length}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                                    <span className="text-red-400">Pendientes</span>
                                                    <span className="font-bold text-red-400 text-xl">
                                                        {members.filter(m => {
                                                            const month = currentDate.getMonth() + 1;
                                                            const year = currentDate.getFullYear();
                                                            const key = `${m.id}_${year}-${month}`;
                                                            return !payments[key];
                                                        }).length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 2 && (
                            <HistoryReport
                                members={members}
                                payments={payments}
                                currentDate={currentDate}
                                onChangeMonth={changeMonth}
                                onSelectMonth={selectSpecificMonth}
                                onDeleteHistorical={deleteHistorical}
                                isGuest={isGuest}
                            />
                        )}
                    </div>
                </div>

                {!isGuest && activeTab === 1 && (
                    <WhatsAppButton className="absolute bottom-8 right-8" />
                )}
            </main>
        </div>
    );
}

import { Users, DollarSign, List } from 'lucide-react';
import { User } from 'firebase/auth';
import { Header } from './Header';
import { MemberManagement } from './MemberManagement';
import { PaymentList } from './PaymentList';
import { HistoryReport } from './HistoryReport';
import { WhatsAppButton } from './WhatsAppButton';
import { Member, PaymentData, Request } from '../../../types';

interface MobileLayoutProps {
    user: User | null;
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
    requests?: Request[];
    onAcceptRequest?: (request: Request) => Promise<void>;
    onRejectRequest?: (requestId: string) => Promise<void>;
    onToggleExempt: (id: string, isExempt: boolean) => Promise<void>;
}

export function MobileLayout({
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
    onLogout,
    requests,
    onAcceptRequest,
    onRejectRequest,
    onToggleExempt
}: MobileLayoutProps) {
    return (
        <div className="max-w-md mx-auto h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 font-sans relative overflow-hidden text-white">
            <Header
                user={user}
                onLogout={onLogout}
                requests={requests}
                onAcceptRequest={onAcceptRequest}
                onRejectRequest={onRejectRequest}
                isGuest={isGuest}
            />

            <main className="flex-1 overflow-y-auto p-4 relative">
                {activeTab === 0 && !isGuest && (
                    <MemberManagement
                        members={members}
                        onAddMember={addMember}
                        onRemoveMember={removeMember}
                        onToggleExempt={onToggleExempt}
                    />
                )}

                {activeTab === 1 && (
                    <PaymentList
                        members={members}
                        payments={payments}
                        currentDate={currentDate}
                        onChangeMonth={changeMonth}
                        onMarkAsPaid={markAsPaid}
                        onUndoPayment={undoPayment}
                        isGuest={isGuest}
                    />
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
            </main>

            {activeTab === 1 && !isGuest && <WhatsAppButton />}

            <nav className="bg-gray-900/90 backdrop-blur-lg border-t border-white/10 flex justify-around p-2 pb-2 shadow-2xl z-20 shrink-0">
                {!isGuest && (
                    <button onClick={() => setActiveTab(0)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 0 ? 'text-green-400 bg-white/10 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}><Users className={`w-6 h-6 mb-1 ${activeTab === 0 ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold uppercase tracking-wide">Gestión</span></button>
                )}
                <button onClick={() => setActiveTab(1)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 1 ? 'text-green-400 bg-white/10 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}><DollarSign className="w-7 h-7 mb-0.5" strokeWidth={activeTab === 1 ? 3 : 2} /><span className="text-[10px] font-bold uppercase tracking-wide">Pagos</span></button>
                <button onClick={() => setActiveTab(2)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 2 ? 'text-green-400 bg-white/10 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}><List className="w-6 h-6 mb-1" strokeWidth={activeTab === 2 ? 3 : 2} /><span className="text-[10px] font-bold uppercase tracking-wide">Historial</span></button>
            </nav>
        </div>
    );
}

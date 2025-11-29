import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, AlertCircle, Check, RotateCcw, Lock } from 'lucide-react';
import { Member, PaymentData } from '../../../types';

interface PaymentListProps {
    members: Member[];
    payments: Record<string, PaymentData>;
    currentDate: Date;
    onChangeMonth: (offset: number) => void;
    onMarkAsPaid: (member: Member, key: string) => Promise<void>;
    onUndoPayment: (key: string) => Promise<void>;
    isGuest: boolean; // Kept for compatibility, but logic inside uses it for read-only
    role?: 'admin' | 'member' | 'visitor';
}

export function PaymentList({ members, payments, currentDate, onChangeMonth, onMarkAsPaid, onUndoPayment, isGuest = false, role }: PaymentListProps) {
    const [paymentToUndo, setPaymentToUndo] = useState<string | null>(null);

    const monthName = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });

    // Determine effective role if not passed
    const effectiveRole = role || (isGuest ? 'visitor' : 'admin');
    const isReadOnly = effectiveRole !== 'admin';
    const showVisitorBanner = effectiveRole === 'visitor';

    const getPaymentKey = (memberId: string) => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        return `${memberId}_${year}-${month}`;
    };

    const handleUndo = async (memberId: string) => {
        const key = getPaymentKey(memberId);
        await onUndoPayment(key);
        setPaymentToUndo(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-24">
            <div className="flex justify-between items-center bg-white/5 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white/10">
                <button onClick={() => onChangeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-green-400 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2"><Calendar className="w-5 h-5 text-green-500" /> {monthName}</h2>
                <button onClick={() => onChangeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-green-400 transition-colors"><ChevronRight className="w-6 h-6" /></button>
            </div>

            {showVisitorBanner && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 text-blue-300 animate-in fade-in slide-in-from-top-2">
                    <Lock className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Estás en modo visitante. Solo puedes ver la información.</p>
                </div>
            )}

            <div className="grid gap-4">
                {members.length === 0 && <div className="text-center py-10 opacity-60"><Users className="w-12 h-12 mx-auto mb-2 text-gray-500" /><p className="text-gray-400">Agrega integrantes en Gestión</p></div>}

                {members.filter(m => !m.isExempt).map(member => {
                    const key = getPaymentKey(member.id);
                    const isPaid = !!payments[key];
                    const isConfirmingUndo = paymentToUndo === member.id;

                    return (
                        <div key={member.id} className="relative transition-all duration-300">
                            {isConfirmingUndo ? (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-200 shadow-sm">
                                    <p className="text-yellow-400 font-medium text-center flex items-center gap-2"><AlertCircle className="w-5 h-5" />¿Revertir pago?</p>
                                    <div className="flex gap-3 w-full">
                                        <button onClick={() => setPaymentToUndo(null)} className="flex-1 py-2 bg-white/5 border border-yellow-500/30 text-yellow-200 rounded-lg font-medium hover:bg-white/10">Cancelar</button>
                                        <button onClick={() => handleUndo(member.id)} className="flex-1 py-2 bg-yellow-600 text-white rounded-lg font-bold shadow-sm hover:bg-yellow-500">Revertir</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <button
                                        onClick={() => !isPaid && !isReadOnly && onMarkAsPaid(member, key)}
                                        disabled={isPaid || isReadOnly}
                                        className={`flex-1 p-5 rounded-xl shadow-lg text-left transition-all transform active:scale-[0.98] flex justify-between items-center relative overflow-hidden ${isPaid ? 'bg-white/5 text-gray-400 cursor-default border border-white/10' : isReadOnly ? 'bg-white/5 text-gray-400 cursor-default border border-white/10' : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-green-900/20 hover:to-green-500 border-b-4 border-green-800'}`}
                                    >
                                        <span className="font-bold text-xl truncate pr-2 z-10 relative">{member.name}</span>
                                        {isPaid ? (
                                            <span className="flex items-center gap-1 text-sm font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full shrink-0 z-10 shadow-sm border border-green-500/30">PAGADO <Check className="w-4 h-4" /></span>
                                        ) : (
                                            !isReadOnly && <span className="text-xs sm:text-sm bg-black/30 px-3 py-1 rounded-full shrink-0 z-10 backdrop-blur-sm border border-white/10">Tocar para cobrar</span>
                                        )}
                                    </button>
                                    {isPaid && !isReadOnly && <button onClick={() => setPaymentToUndo(member.id)} className="p-4 bg-white/5 text-yellow-500 rounded-xl border border-white/10 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30 transition-all shadow-sm" title="Revertir pago"><RotateCcw className="w-6 h-6" /></button>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

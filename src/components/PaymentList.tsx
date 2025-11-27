import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, AlertCircle, Check, RotateCcw, Lock } from 'lucide-react';
import { Member, PaymentData } from '../types';

interface PaymentListProps {
    members: Member[];
    payments: Record<string, PaymentData>;
    currentDate: Date;
    onChangeMonth: (offset: number) => void;
    onMarkAsPaid: (member: Member, key: string) => Promise<void>;
    onUndoPayment: (key: string) => Promise<void>;
    isGuest?: boolean;
}

export function PaymentList({ members, payments, currentDate, onChangeMonth, onMarkAsPaid, onUndoPayment, isGuest = false }: PaymentListProps) {
    const [paymentToUndo, setPaymentToUndo] = useState<string | null>(null);

    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

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
            <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <button onClick={() => onChangeMonth(-1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2"><Calendar className="w-5 h-5 text-green-600" /> {monthName}</h2>
                <button onClick={() => onChangeMonth(1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors"><ChevronRight className="w-6 h-6" /></button>
            </div>

            {isGuest && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-800 animate-in fade-in slide-in-from-top-2">
                    <Lock className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Estás en modo visitante. Solo puedes ver la información.</p>
                </div>
            )}

            <div className="grid gap-4">
                {members.length === 0 && <div className="text-center py-10 opacity-60"><Users className="w-12 h-12 mx-auto mb-2 text-gray-400" /><p className="text-gray-500">Agrega integrantes en Gestión</p></div>}

                {members.map(member => {
                    const key = getPaymentKey(member.id);
                    const isPaid = !!payments[key];
                    const isConfirmingUndo = paymentToUndo === member.id;

                    return (
                        <div key={member.id} className="relative transition-all duration-300">
                            {isConfirmingUndo ? (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-200 shadow-sm">
                                    <p className="text-yellow-800 font-medium text-center flex items-center gap-2"><AlertCircle className="w-5 h-5" />¿Revertir pago?</p>
                                    <div className="flex gap-3 w-full">
                                        <button onClick={() => setPaymentToUndo(null)} className="flex-1 py-2 bg-white border border-yellow-300 text-yellow-800 rounded-lg font-medium hover:bg-yellow-50">Cancelar</button>
                                        <button onClick={() => handleUndo(member.id)} className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-bold shadow-sm hover:bg-yellow-600">Revertir</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <button
                                        onClick={() => !isPaid && !isGuest && onMarkAsPaid(member, key)}
                                        disabled={isPaid || isGuest}
                                        className={`flex-1 p-5 rounded-xl shadow-md text-left transition-all transform active:scale-[0.98] flex justify-between items-center relative overflow-hidden ${isPaid ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200' : isGuest ? 'bg-gray-50 text-gray-500 cursor-default border border-gray-200' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:to-green-500 border-b-4 border-green-700'}`}
                                    >
                                        <span className="font-bold text-xl truncate pr-2 z-10 relative">{member.name}</span>
                                        {isPaid ? (
                                            <span className="flex items-center gap-1 text-sm font-bold bg-gray-200 text-gray-500 px-3 py-1 rounded-full shrink-0 z-10 shadow-sm border border-gray-300">PAGADO <Check className="w-4 h-4" /></span>
                                        ) : (
                                            !isGuest && <span className="text-xs sm:text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full shrink-0 z-10 backdrop-blur-sm">Tocar para cobrar</span>
                                        )}
                                    </button>
                                    {isPaid && !isGuest && <button onClick={() => setPaymentToUndo(member.id)} className="p-4 bg-white text-yellow-500 rounded-xl border border-gray-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 transition-all shadow-sm group-hover:shadow-md" title="Revertir pago"><RotateCcw className="w-6 h-6" /></button>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

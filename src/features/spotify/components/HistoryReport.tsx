import { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, List, Trash2, Lock } from 'lucide-react';
import { Member, PaymentData, ReportRow } from '../../../types';

interface HistoryReportProps {
    members: Member[];
    payments: Record<string, PaymentData>;
    currentDate: Date;
    onChangeMonth: (offset: number) => void;
    onSelectMonth: (monthIndex: number) => void;
    onDeleteHistorical: (key: string) => Promise<void>;
    isGuest?: boolean; // Kept for compatibility
    role?: 'admin' | 'member' | 'visitor';
}

export function HistoryReport({ members, payments, currentDate, onChangeMonth, onSelectMonth, onDeleteHistorical, isGuest = false, role }: HistoryReportProps) {
    const [showMonthGrid, setShowMonthGrid] = useState(false);
    const [historicalToDelete, setHistoricalToDelete] = useState<string | null>(null);

    // Determine effective role
    const effectiveRole = role || (isGuest ? 'visitor' : 'admin');
    const isReadOnly = effectiveRole !== 'admin';
    const showVisitorBanner = effectiveRole === 'visitor';

    const monthName = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    const monthNamesList = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const formatDateTime = (isoString: string | undefined | null) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const getPaymentKey = (memberId: string) => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        return `${memberId}_${year}-${month}`;
    };

    const getReportData = (): ReportRow[] => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const suffix = `_${year}-${month}`;
        const rows: ReportRow[] = [];
        const processedIds = new Set<string>();

        Object.keys(payments).forEach(key => {
            if (key.endsWith(suffix)) {
                const parts = key.split('_');
                const memberId = parts[0];
                const paymentData = payments[key];
                const date = paymentData?.date;
                const savedName = paymentData?.name;
                const currentMember = members.find(m => m.id === memberId);
                const displayName = savedName || (currentMember ? currentMember.name : 'Exmiembro');
                rows.push({ id: memberId, key: key, name: displayName, isPaid: true, date: date, isExMember: !currentMember });
                processedIds.add(memberId);
            }
        });

        members.forEach(member => {
            if (!processedIds.has(member.id) && !member.isExempt) {
                rows.push({ id: member.id, key: getPaymentKey(member.id), name: member.name, isPaid: false, date: null, isExMember: false });
            }
        });
        return rows.sort((a, b) => a.name.localeCompare(b.name));
    };

    const reportData = getReportData();

    const handleSelectMonth = (index: number) => {
        onSelectMonth(index);
        setShowMonthGrid(false);
    };

    const handleDelete = async (key: string) => {
        await onDeleteHistorical(key);
        setHistoricalToDelete(null);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10 shadow-sm mb-4 transition-all">
                <div className="flex justify-between items-center w-full p-2">
                    <button onClick={() => onChangeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-green-400 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                    <div className="text-center cursor-pointer hover:bg-white/5 px-6 py-2 rounded-lg transition-colors group relative select-none" onClick={() => setShowMonthGrid(!showMonthGrid)}>
                        <h2 className="text-lg font-bold text-white capitalize flex items-center justify-center gap-2"><Calendar className="w-5 h-5 text-green-500" /> {monthName} <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMonthGrid ? 'rotate-180' : ''}`} /></h2>
                        <p className="text-[10px] text-green-400 font-medium tracking-wide uppercase mt-0.5">Toca para cambiar</p>
                    </div>
                    <button onClick={() => onChangeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-green-400 transition-colors"><ChevronRight className="w-6 h-6" /></button>
                </div>
                {showMonthGrid && (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-900/50 border-t border-white/10 animate-in slide-in-from-top-2">
                        {monthNamesList.map((mName, index) => (
                            <button key={mName} onClick={() => handleSelectMonth(index)} className={`py-3 text-sm font-medium rounded-lg transition-all ${currentDate.getMonth() === index ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'}`}>{mName}</button>
                        ))}
                    </div>
                )}
            </div>

            {showVisitorBanner && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 text-blue-300 animate-in fade-in slide-in-from-top-2">
                    <Lock className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Estás en modo visitante. Solo puedes ver la información.</p>
                </div>
            )}

            {!showMonthGrid && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-white/10 animate-in fade-in duration-300">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 border-b border-white/10">
                            <tr>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Integrante</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Fecha</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reportData.map(row => (
                                <tr key={row.key || row.id} className={`transition-colors hover:bg-white/5 ${row.isPaid ? 'bg-green-500/5' : ''}`}>
                                    <td className="p-3 font-medium text-gray-200">
                                        {row.name} {row.isExMember && <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[9px] bg-gray-700 text-gray-400 font-bold uppercase tracking-wider">Ex</span>}
                                    </td>
                                    <td className="p-3">{row.isPaid ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">Pagado</span> : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">Pendiente</span>}</td>
                                    <td className="p-3 text-xs text-gray-400 text-right font-mono">{formatDateTime(row.date)}</td>
                                    <td className="p-3 text-right relative">
                                        {row.isPaid && !isReadOnly && (historicalToDelete === row.key ? (<div className="flex gap-1 absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 shadow-lg rounded-md border border-red-500/30 p-1 animate-in slide-in-from-right-5 z-20"><button onClick={() => setHistoricalToDelete(null)} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded hover:bg-white/20">No</button><button onClick={() => handleDelete(row.key)} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500">Sí</button></div>) : (<button onClick={() => setHistoricalToDelete(row.key)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-all" title="Borrar registro permanentemente"><Trash2 className="w-4 h-4" /></button>))}
                                    </td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (<tr><td colSpan={4} className="p-10 text-center"><List className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-gray-500 text-sm">Sin datos para este mes</p></td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, List, Trash2, Lock } from 'lucide-react';
import { Member, PaymentData, ReportRow } from '../types';

interface HistoryReportProps {
    members: Member[];
    payments: Record<string, PaymentData>;
    currentDate: Date;
    onChangeMonth: (offset: number) => void;
    onSelectMonth: (monthIndex: number) => void;
    onDeleteHistorical: (key: string) => Promise<void>;
    isGuest?: boolean;
}

export function HistoryReport({ members, payments, currentDate, onChangeMonth, onSelectMonth, onDeleteHistorical, isGuest = false }: HistoryReportProps) {
    const [showMonthGrid, setShowMonthGrid] = useState(false);
    const [historicalToDelete, setHistoricalToDelete] = useState<string | null>(null);

    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const monthNamesList = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const formatDateTime = (isoString: string | undefined | null) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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
                const displayName = savedName || (currentMember ? currentMember.name : 'Ex-Miembro');
                rows.push({ id: memberId, key: key, name: displayName, isPaid: true, date: date, isExMember: !currentMember });
                processedIds.add(memberId);
            }
        });

        members.forEach(member => {
            if (!processedIds.has(member.id)) {
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
            <div className="flex flex-col bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-4 transition-all">
                <div className="flex justify-between items-center w-full p-2">
                    <button onClick={() => onChangeMonth(-1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                    <div className="text-center cursor-pointer hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors group relative select-none" onClick={() => setShowMonthGrid(!showMonthGrid)}>
                        <h2 className="text-lg font-bold text-gray-800 capitalize flex items-center justify-center gap-2"><Calendar className="w-5 h-5 text-green-600" /> {monthName} <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMonthGrid ? 'rotate-180' : ''}`} /></h2>
                        <p className="text-[10px] text-green-600 font-medium tracking-wide uppercase mt-0.5">Toca para cambiar</p>
                    </div>
                    <button onClick={() => onChangeMonth(1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors"><ChevronRight className="w-6 h-6" /></button>
                </div>
                {showMonthGrid && (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">
                        {monthNamesList.map((mName, index) => (
                            <button key={mName} onClick={() => handleSelectMonth(index)} className={`py-3 text-sm font-medium rounded-lg transition-all ${currentDate.getMonth() === index ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-white text-gray-600 hover:bg-green-100 border border-gray-200'}`}>{mName}</button>
                        ))}
                    </div>
                )}
            </div>

            {isGuest && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-800 animate-in fade-in slide-in-from-top-2">
                    <Lock className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Estás en modo visitante. Solo puedes ver la información.</p>
                </div>
            )}

            {!showMonthGrid && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 animate-in fade-in duration-300">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Integrante</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Fecha</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reportData.map(row => (
                                <tr key={row.key || row.id} className={`transition-colors hover:bg-gray-50 ${row.isPaid ? 'bg-green-50/40' : ''}`}>
                                    <td className="p-3 font-medium text-gray-800">
                                        {row.name} {row.isExMember && <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[9px] bg-gray-200 text-gray-500 font-bold uppercase tracking-wider">Ex</span>}
                                    </td>
                                    <td className="p-3">{row.isPaid ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Pagado</span> : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">Pendiente</span>}</td>
                                    <td className="p-3 text-xs text-gray-500 text-right font-mono">{formatDateTime(row.date)}</td>
                                    <td className="p-3 text-right relative">
                                        {row.isPaid && !isGuest && (historicalToDelete === row.key ? (<div className="flex gap-1 absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-md border border-red-100 p-1 animate-in slide-in-from-right-5 z-20"><button onClick={() => setHistoricalToDelete(null)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200">No</button><button onClick={() => handleDelete(row.key)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Sí</button></div>) : (<button onClick={() => setHistoricalToDelete(row.key)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all" title="Borrar registro permanentemente"><Trash2 className="w-4 h-4" /></button>))}
                                    </td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (<tr><td colSpan={4} className="p-10 text-center"><List className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">Sin datos para este mes</p></td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

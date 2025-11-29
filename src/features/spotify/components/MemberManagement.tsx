
import React, { useState } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { Member } from '../../../types';

interface MemberManagementProps {
    members: Member[];
    onAddMember: (name: string) => Promise<void>;
    onRemoveMember: (id: string) => Promise<void>;
    onToggleExempt: (id: string, isExempt: boolean) => Promise<void>;
}

export function MemberManagement({ members, onAddMember, onRemoveMember, onToggleExempt }: MemberManagementProps) {
    const [newMemberName, setNewMemberName] = useState('');
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newMemberName.trim()) return;
        await onAddMember(newMemberName);
        setNewMemberName('');
    };

    const handleRemove = async (id: string) => {
        await onRemoveMember(id);
        setMemberToDelete(null);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-400" /> Gestión de Familia
            </h2>
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newMemberName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMemberName(e.target.value)}
                    placeholder="Nuevo integrante..."
                    className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAdd()}
                />
                <button
                    onClick={handleAdd}
                    disabled={!newMemberName.trim()}
                    className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                >
                    <UserPlus className="w-6 h-6" />
                </button>
            </div>
            <div className="space-y-2">
                {members.length === 0 && <p className="text-gray-400 text-center py-4 bg-white/5 rounded-xl border border-dashed border-gray-700">La lista está vacía.</p>}
                {members.map(member => (
                    <div key={member.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/10 transition-all hover:bg-white/10">
                        {memberToDelete === member.id ? (
                            <div className="flex items-center justify-between bg-red-500/10 p-2 rounded-lg -m-2 animate-in slide-in-from-right-2 border border-red-500/20">
                                <span className="text-sm text-red-400 font-medium truncate max-w-[150px]">¿Borrar a {member.name}?</span>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => setMemberToDelete(null)} className="px-3 py-1 text-xs font-bold text-gray-300 bg-white/10 border border-white/10 rounded hover:bg-white/20 transition-colors">No</button>
                                    <button onClick={() => handleRemove(member.id)} className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-500 shadow-sm transition-colors">Sí</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-lg text-gray-200">{member.name}</span>
                                    {member.isExempt && (
                                        <span className="text-[10px] uppercase font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                                            Especial
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onToggleExempt(member.id, !member.isExempt)}
                                        className={`p-2 rounded-lg transition-colors text-xs font-bold border ${member.isExempt ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200'}`}
                                        title={member.isExempt ? "Quitar estado especial" : "Marcar como miembro especial (no paga)"}
                                    >
                                        {member.isExempt ? 'VIP' : 'Normal'}
                                    </button>
                                    <button onClick={() => setMemberToDelete(member.id)} className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

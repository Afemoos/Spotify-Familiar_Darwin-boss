import { Group } from '../../../types';

interface GroupListProps {
    groups: Group[];
    onSelectGroup: (group: Group) => void;
}

export function GroupList({ groups, onSelectGroup }: GroupListProps) {
    if (groups.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Mis Grupos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => (
                    <div
                        key={group.id}
                        onClick={() => onSelectGroup(group)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 cursor-pointer transition-all group"
                    >
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{group.name}</h4>
                        <p className="text-gray-400 text-sm">Creado el {new Date(group.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

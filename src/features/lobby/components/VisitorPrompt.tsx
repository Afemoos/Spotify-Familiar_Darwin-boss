import { useState } from 'react';
import { X } from 'lucide-react';

interface VisitorPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadGroup: (code: string) => Promise<boolean>;
    onSuccess: () => void;
}

export function VisitorPrompt({ isOpen, onClose, onLoadGroup, onSuccess }: VisitorPromptProps) {
    const [visitorCode, setVisitorCode] = useState('');
    const [loadingVisitor, setLoadingVisitor] = useState(false);

    if (!isOpen) return null;

    const handleVisitorSubmit = async () => {
        if (visitorCode.length < 6) return;
        setLoadingVisitor(true);
        const success = await onLoadGroup(visitorCode);
        if (success) {
            onClose();
            onSuccess();
        } else {
            alert("Código no encontrado");
        }
        setLoadingVisitor(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white">Acceso de Visitante</h2>
                    <p className="text-sm text-gray-400">Ingresa el código del grupo para ver la información.</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Código (ej. DARWIN)"
                        value={visitorCode}
                        onChange={(e) => setVisitorCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleVisitorSubmit();
                            }
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white uppercase text-center text-lg tracking-widest"
                        maxLength={6}
                        autoFocus
                    />
                    <button
                        onClick={handleVisitorSubmit}
                        disabled={loadingVisitor || visitorCode.length < 6}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loadingVisitor ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Ver Grupo'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

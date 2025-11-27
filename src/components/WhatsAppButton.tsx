import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface WhatsAppButtonProps {
    className?: string;
}

export function WhatsAppButton({ className = "absolute bottom-24 right-4" }: WhatsAppButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const sendWhatsAppNotice = () => {
        const message = `🚨⚠️
    _Bueno, ¿qué? ¿No van a pagar o qué?_
    _Actualmente estás en mora del pago por concepto de: Spotify Familiar._
    _Paga y sigue disfrutando de tu música favorita_
    _Notificación automática creada por: Afemos_`;

        const text = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setShowConfirm(false);
    };

    return (
        <div className={`${className} z-50`}>
            {showConfirm ? (
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-3 w-64 animate-in slide-in-from-bottom-5 mb-4">
                    <div className="text-white font-medium">
                        <p>¿Enviar recordatorio?</p>
                        <p className="text-xs text-gray-300 italic mt-1 whitespace-pre-line">
                            "🚨⚠️ Bueno, ¿qué? ¿No van a pagar..."
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-white/10 rounded-lg text-sm font-bold text-gray-300 hover:bg-white/20 transition-colors">Cancelar</button>
                        <button onClick={sendWhatsAppNotice} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-500 flex items-center justify-center gap-1 shadow-lg shadow-green-900/20">
                            <Send className="w-4 h-4" /> Enviar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-110 flex items-center gap-2 font-bold border-4 border-gray-900"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span>Enviar aviso</span>
                </button>
            )}
        </div>
    );
}

import { useState } from 'react';
import { Users, DollarSign, List } from 'lucide-react';
import { useSpotifyData } from './hooks/useSpotifyData';
import { Header } from './components/Header';
import { MemberManagement } from './components/MemberManagement';
import { PaymentList } from './components/PaymentList';
import { HistoryReport } from './components/HistoryReport';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Login } from './components/Login';

export default function SpotifyTracker() {
  const { user, members, payments, isLoading, addMember, removeMember, markAsPaid, undoPayment, deleteHistorical } = useSpotifyData();
  const [activeTab, setActiveTab] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const selectSpecificMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const handleGuestLogin = () => {
    setIsAuthenticated(true);
    setIsGuest(true);
    setActiveTab(1); // Default to Payments tab for guests
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} onGuestLogin={handleGuestLogin} />;
  }

  if (isLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-green-600 flex-col gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="font-medium animate-pulse">Cargando...</p>
      </div>
    );
  }

  <button onClick={() => setActiveTab(0)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 0 ? 'text-green-600 bg-green-50 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}><Users className={`w-6 h-6 mb-1 ${activeTab === 0 ? 'fill-current' : ''}`} /><span className="text-[10px] font-bold uppercase tracking-wide">Gestión</span></button>
        )
}
        <button onClick={() => setActiveTab(1)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 1 ? 'text-green-600 bg-green-50 shadow-sm translate-y-[-8px] scale-110' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}><DollarSign className="w-7 h-7 mb-0.5" strokeWidth={activeTab === 1 ? 3 : 2} /><span className="text-[10px] font-bold uppercase tracking-wide">Pagos</span></button>
        <button onClick={() => setActiveTab(2)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 2 ? 'text-green-600 bg-green-50 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}><List className="w-6 h-6 mb-1" strokeWidth={activeTab === 2 ? 3 : 2} /><span className="text-[10px] font-bold uppercase tracking-wide">Historial</span></button>
      </nav >
    </div >
  );
}
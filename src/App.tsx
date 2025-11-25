import { useState, useEffect } from 'react';
import { Trash2, UserPlus, RotateCcw, Check, Users, DollarSign, List, Calendar, AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Cloud, CloudOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; // CORRECCIÓN 1: Importación de tipo explícita
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAqdGa3XsyJfT9ZuG060yK0A8RK-nJljxQ",
  authDomain: "spotify-control-familia.firebaseapp.com",
  projectId: "spotify-control-familia",
  storageBucket: "spotify-control-familia.firebasestorage.app",
  messagingSenderId: "83431996940",
  appId: "1:83431996940:web:b8200841df52cc0028b829",
  measurementId: "G-C1G10LLCHS"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID fijo para el grupo
const APP_ID = 'mi-grupo-familiar-spotify'; 

// --- TIPOS DE DATOS ---
interface Member {
  id: string;
  name: string;
  createdAt: number;
}

interface PaymentData {
  date: string;
  name: string;
}

interface ReportRow {
  id: string;
  key: string;
  name: string;
  isPaid: boolean;
  date: string | null;
  isExMember: boolean;
}

export default function SpotifyTracker() {
  // --- ESTADOS ---
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Record<string, PaymentData>>({});
  const [newMemberName, setNewMemberName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados visuales
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [paymentToUndo, setPaymentToUndo] = useState<string | null>(null);
  const [historicalToDelete, setHistoricalToDelete] = useState<string | null>(null);

  // --- EFECTO 1: AUTENTICACIÓN ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error de autenticación:", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- EFECTO 2: SINCRONIZACIÓN DE DATOS ---
  useEffect(() => {
    if (!user) return;

    const membersRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members');
    const paymentsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments');

    const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
      const loadedMembers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(loadedMembers.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
      setIsLoading(false);
    }, (error) => console.error("Error cargando miembros:", error));

    const unsubscribePayments = onSnapshot(paymentsRef, (snapshot) => {
      const loadedPayments: Record<string, PaymentData> = {};
      snapshot.docs.forEach(doc => {
        loadedPayments[doc.id] = doc.data() as PaymentData;
      });
      setPayments(loadedPayments);
    }, (error) => console.error("Error cargando pagos:", error));

    return () => {
      unsubscribeMembers();
      unsubscribePayments();
    };
  }, [user]);

  // --- FUNCIONES ---

  const getPaymentKey = (memberId: string) => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return `${memberId}_${year}-${month}`;
  };

  const addMember = async () => {
    if (!newMemberName.trim() || !user) return;
    
    const newId = Date.now().toString();
    const newMember = {
      name: newMemberName.trim(),
      createdAt: Date.now()
    };

    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members', newId);
      await setDoc(docRef, newMember);
      setNewMemberName('');
    } catch (e) {
      console.error("Error al guardar:", e);
      alert("Error de conexión. Intenta de nuevo.");
    }
  };

  const confirmRemoveMember = async (id: string) => {
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members', id);
      await deleteDoc(docRef);
      setMemberToDelete(null);
    } catch (e) {
      console.error("Error al borrar:", e);
    }
  };

  const markAsPaid = async (member: Member) => {
    if (!user) return;
    const key = getPaymentKey(member.id);
    
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments', key);
      await setDoc(docRef, {
        date: new Date().toISOString(),
        name: member.name
      });
    } catch (e) {
      console.error("Error al pagar:", e);
    }
  };

  const confirmUndoPayment = async (memberId: string) => {
    const key = getPaymentKey(memberId);
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments', key);
      await deleteDoc(docRef);
      setPaymentToUndo(null);
    } catch (e) {
      console.error("Error al revertir:", e);
    }
  };
  
  const confirmDeleteHistorical = async (key: string) => {
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments', key);
      await deleteDoc(docRef);
      setHistoricalToDelete(null);
    } catch (e) {
      console.error("Error al borrar historial:", e);
    }
  };

  // --- HELPERS VISUALES ---

  const formatDateTime = (isoString: string | undefined | null) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const selectSpecificMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthGrid(false);
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const monthNamesList = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // --- LÓGICA DE REPORTES ---
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

        rows.push({
          id: memberId,
          key: key,
          name: displayName,
          isPaid: true,
          date: date,
          isExMember: !currentMember
        });
        processedIds.add(memberId);
      }
    });

    members.forEach(member => {
      if (!processedIds.has(member.id)) {
        rows.push({
          id: member.id,
          key: getPaymentKey(member.id),
          name: member.name,
          isPaid: false,
          date: null,
          isExMember: false
        });
      }
    });

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  };

  const reportData = getReportData();

  // --- RENDERIZADO ---

  if (isLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-green-600 flex-col gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="font-medium animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 pt-6 shadow-lg z-10 flex justify-between items-center">
        <div className="w-6"></div> {/* Spacer */}
        <h1 className="text-xl font-bold flex items-center gap-2">
           <span className="bg-green-500 p-1 rounded-full"><DollarSign className="w-4 h-4 text-white" /></span>
           Control de Spotify
        </h1>
        <div title={user ? "Conectado" : "Desconectado"}>
          {user ? <Cloud className="w-5 h-5 text-green-400" /> : <CloudOff className="w-5 h-5 text-red-400" />}
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-4">
        
        {/* VISTA 1: GESTIÓN */}
        {activeTab === 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" /> Gestión de Familia
            </h2>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nuevo integrante..."
                className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && addMember()}
              />
              <button 
                onClick={addMember}
                disabled={!newMemberName.trim()}
                className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {members.length === 0 && <p className="text-gray-500 text-center py-4 bg-white rounded-lg border border-dashed">La lista está vacía.</p>}
              {members.map(member => (
                <div key={member.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all">
                  {memberToDelete === member.id ? (
                    <div className="flex items-center justify-between bg-red-50 p-2 rounded -m-2 animate-in slide-in-from-right-2">
                      <span className="text-sm text-red-800 font-medium truncate max-w-[150px]">¿Borrar a {member.name}?</span>
                      <div className="flex gap-2 shrink-0">
                         <button 
                           onClick={() => setMemberToDelete(null)}
                           className="px-3 py-1 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100"
                         >
                           No
                         </button>
                         <button 
                           onClick={() => confirmRemoveMember(member.id)}
                           className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 shadow-sm"
                         >
                           Sí
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center group">
                      <span className="font-medium text-lg text-gray-700">{member.name}</span>
                      <button 
                        onClick={() => setMemberToDelete(member.id)}
                        className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 2: PAGOS */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-green-600" /> {monthName}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid gap-4">
              {members.length === 0 && (
                <div className="text-center py-10 opacity-60">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Agrega integrantes en Gestión</p>
                </div>
              )}
              
              {members.map(member => {
                const key = getPaymentKey(member.id);
                const isPaid = !!payments[key];
                const isConfirmingUndo = paymentToUndo === member.id;

                return (
                  <div key={member.id} className="relative transition-all duration-300">
                     {isConfirmingUndo ? (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-200 shadow-sm">
                           <p className="text-yellow-800 font-medium text-center flex items-center gap-2">
                             <AlertCircle className="w-5 h-5" />
                             ¿Revertir pago?
                           </p>
                           <div className="flex gap-3 w-full">
                              <button 
                                onClick={() => setPaymentToUndo(null)}
                                className="flex-1 py-2 bg-white border border-yellow-300 text-yellow-800 rounded-lg font-medium hover:bg-yellow-50"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={() => confirmUndoPayment(member.id)}
                                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-bold shadow-sm hover:bg-yellow-600"
                              >
                                Revertir
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 group">
                          <button
                            onClick={() => !isPaid && markAsPaid(member)}
                            disabled={isPaid}
                            className={`
                              flex-1 p-5 rounded-xl shadow-md text-left transition-all transform active:scale-[0.98]
                              flex justify-between items-center relative overflow-hidden
                              ${isPaid 
                                ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200' 
                                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:to-green-500 border-b-4 border-green-700'}
                            `}
                          >
                            <span className="font-bold text-xl truncate pr-2 z-10 relative">{member.name}</span>
                            {isPaid ? (
                              <span className="flex items-center gap-1 text-sm font-bold bg-gray-200 text-gray-500 px-3 py-1 rounded-full shrink-0 z-10 shadow-sm border border-gray-300">
                                PAGADO <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full shrink-0 z-10 backdrop-blur-sm">
                                Tocar para cobrar
                              </span>
                            )}
                          </button>

                          {isPaid && (
                            <button
                              onClick={() => setPaymentToUndo(member.id)}
                              className="p-4 bg-white text-yellow-500 rounded-xl border border-gray-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 transition-all shadow-sm group-hover:shadow-md"
                              title="Revertir pago"
                            >
                              <RotateCcw className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                     )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 3: HISTORIAL */}
        {activeTab === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-4 transition-all">
              <div className="flex justify-between items-center w-full p-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div 
                  className="text-center cursor-pointer hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors group relative select-none"
                  onClick={() => setShowMonthGrid(!showMonthGrid)}
                >
                  <h2 className="text-lg font-bold text-gray-800 capitalize flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" /> {monthName}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMonthGrid ? 'rotate-180' : ''}`} />
                  </h2>
                  <p className="text-[10px] text-green-600 font-medium tracking-wide uppercase mt-0.5">Toca para cambiar</p>
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-green-50 rounded-full text-green-700 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {showMonthGrid && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">
                  {monthNamesList.map((mName, index) => (
                    <button
                      key={mName}
                      onClick={() => selectSpecificMonth(index)}
                      className={`
                        py-3 text-sm font-medium rounded-lg transition-all
                        ${currentDate.getMonth() === index 
                          ? 'bg-green-600 text-white shadow-md scale-105' 
                          : 'bg-white text-gray-600 hover:bg-green-100 border border-gray-200'}
                      `}
                    >
                      {mName}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                          {row.name}
                          {row.isExMember && (
                            <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[9px] bg-gray-200 text-gray-500 font-bold uppercase tracking-wider">Ex</span>
                          )}
                        </td>
                        <td className="p-3">
                          {row.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Pagado</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">Pendiente</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-gray-500 text-right font-mono">{formatDateTime(row.date)}</td>
                        <td className="p-3 text-right relative"> {/* CORRECCIÓN 2: colSpan numérico */}
                          {/* Botón de Borrar Historial con Confirmación Visual */}
                          {row.isPaid && (
                            historicalToDelete === row.key ? (
                              <div className="flex gap-1 absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-md border border-red-100 p-1 animate-in slide-in-from-right-5 z-20">
                                <button 
                                  onClick={() => setHistoricalToDelete(null)}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                                >
                                  No
                                </button>
                                <button 
                                  onClick={() => confirmDeleteHistorical(row.key)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  Sí
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setHistoricalToDelete(row.key)}
                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all"
                                title="Borrar registro permanentemente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                     {reportData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-10 text-center"> {/* CORRECCIÓN 2: Aquí estaba "4", ahora es {4} */}
                            <List className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Sin datos para este mes</p>
                          </td>
                        </tr>
                     )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tabs Inferiores */}
      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <button onClick={() => setActiveTab(0)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 0 ? 'text-green-600 bg-green-50 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
          <Users className={`w-6 h-6 mb-1 ${activeTab === 0 ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Gestión</span>
        </button>
        <button onClick={() => setActiveTab(1)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 1 ? 'text-green-600 bg-green-50 shadow-sm translate-y-[-8px] scale-110' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
          <DollarSign className="w-7 h-7 mb-0.5" strokeWidth={activeTab === 1 ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Pagos</span>
        </button>
        <button onClick={() => setActiveTab(2)} className={`flex flex-col items-center p-2 rounded-xl w-20 transition-all duration-300 ${activeTab === 2 ? 'text-green-600 bg-green-50 translate-y-[-4px]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
          <List className="w-6 h-6 mb-1" strokeWidth={activeTab === 2 ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wide">Historial</span>
        </button>
      </nav>
    </div>
  );
}
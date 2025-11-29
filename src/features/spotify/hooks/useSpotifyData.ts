import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, APP_ID } from '../../../config/firebase';
import { Member, PaymentData, Request } from '../../../types';

import { useAuth } from '../../../context/AuthContext';

export function useSpotifyData() {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [payments, setPayments] = useState<Record<string, PaymentData>>({});
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Removed local onAuthStateChanged listener as we use global AuthContext

    useEffect(() => {
        // Allow fetching even if user is null (visitor mode or mock admin)
        // if (!user) return;

        const membersRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members');
        const paymentsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments');
        const requestsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_requests');

        const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
            const loadedMembers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Member[];
            setMembers(loadedMembers.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
            setIsLoading(false);
        }, (error) => {
            console.error("Error cargando miembros:", error);
            // alert("Error cargando miembros: " + error.message); // Debugging
        });

        const unsubscribePayments = onSnapshot(paymentsRef, (snapshot) => {
            const loadedPayments: Record<string, PaymentData> = {};
            snapshot.docs.forEach(doc => {
                loadedPayments[doc.id] = doc.data() as PaymentData;
            });
            setPayments(loadedPayments);
        }, (error) => {
            console.error("Error cargando pagos:", error);
        });

        const unsubscribeRequests = onSnapshot(requestsRef, (snapshot) => {
            const loadedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Request[];
            setRequests(loadedRequests.sort((a, b) => b.createdAt - a.createdAt));
        }, (error) => console.error("Error cargando solicitudes:", error));

        return () => {
            unsubscribeMembers();
            unsubscribePayments();
            unsubscribeRequests();
        };
    }, [user]);

    const addMember = async (name: string) => {
        if (!name.trim() || !user) return;
        const newId = Date.now().toString();
        const newMember = { name: name.trim(), createdAt: Date.now() };
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members', newId);
            await setDoc(docRef, newMember);
        } catch (e) { console.error(e); throw e; }
    };

    const removeMember = async (id: string) => {
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members', id);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const markAsPaid = async (member: Member, key: string) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments', key);
            await setDoc(docRef, { date: new Date().toISOString(), name: member.name });
        } catch (e) { console.error(e); throw e; }
    };

    const undoPayment = async (key: string) => {
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments', key);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const deleteHistorical = async (key: string) => {
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments', key);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const requestSpot = async (name: string) => {
        if (!name.trim() || !user) return;
        const newId = Date.now().toString();
        const newRequest: Request = {
            id: newId,
            name: name.trim(),
            createdAt: Date.now(),
            status: 'pending'
        };
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_requests', newId);
            await setDoc(docRef, newRequest);
        } catch (e) { console.error(e); throw e; }
    };

    const acceptRequest = async (request: Request) => {
        try {
            await addMember(request.name);
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_requests', request.id);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const rejectRequest = async (requestId: string) => {
        try {
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_requests', requestId);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    return {
        user,
        members,
        payments,
        requests,
        isLoading,
        addMember,
        removeMember,
        markAsPaid,
        undoPayment,
        deleteHistorical,
        requestSpot,
        acceptRequest,
        rejectRequest,
        toggleMemberExempt: async (id: string, isExempt: boolean) => {
            try {
                const { updateDoc } = await import('firebase/firestore');
                const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members', id);
                await updateDoc(docRef, { isExempt });
            } catch (e) { console.error(e); throw e; }
        }
    };
}

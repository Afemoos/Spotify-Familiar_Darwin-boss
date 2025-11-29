import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { Member, PaymentData, Request } from '../types';

export function useSpotifyData(groupId?: string) {
    const [user, setUser] = useState<User | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [payments, setPayments] = useState<Record<string, PaymentData>>({});
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!groupId) {
            setIsLoading(false);
            return;
        }

        const membersRef = collection(db, 'groups', groupId, 'members');
        const paymentsRef = collection(db, 'groups', groupId, 'payments');
        const requestsRef = collection(db, 'groups', groupId, 'requests');

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
    }, [user, groupId]);

    const addMember = async (name: string, userId?: string) => {
        if (!name.trim() || !user || !groupId) return;

        // Calculate if new member should be VIP (exempt)
        // Count members who are NOT exempt (paying members)
        const payingMembersCount = members.filter(m => !m.isExempt).length;
        const isExempt = payingMembersCount >= 6;

        const newId = Date.now().toString();
        const newMember = {
            name: name.trim(),
            createdAt: Date.now(),
            userId,
            isExempt
        };
        try {
            const docRef = doc(db, 'groups', groupId, 'members', newId);
            await setDoc(docRef, newMember);
        } catch (e) { console.error(e); throw e; }
    };

    const removeMember = async (id: string) => {
        if (!groupId) return;
        try {
            const docRef = doc(db, 'groups', groupId, 'members', id);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const markAsPaid = async (member: Member, key: string) => {
        if (!user || !groupId) return;
        try {
            const docRef = doc(db, 'groups', groupId, 'payments', key);
            await setDoc(docRef, { date: new Date().toISOString(), name: member.name });
        } catch (e) { console.error(e); throw e; }
    };

    const undoPayment = async (key: string) => {
        if (!groupId) return;
        try {
            const docRef = doc(db, 'groups', groupId, 'payments', key);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const deleteHistorical = async (key: string) => {
        if (!groupId) return;
        try {
            const docRef = doc(db, 'groups', groupId, 'payments', key);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const requestSpot = async (name: string) => {
        if (!name.trim() || !user || !groupId) return;
        const newId = Date.now().toString();
        const newRequest: Request = {
            id: newId,
            name: name.trim(),
            createdAt: Date.now(),
            status: 'pending',
            userId: user.uid
        };
        try {
            const docRef = doc(db, 'groups', groupId, 'requests', newId);
            await setDoc(docRef, newRequest);
        } catch (e) { console.error(e); throw e; }
    };

    const acceptRequest = async (request: Request) => {
        if (!groupId) return;
        try {
            await addMember(request.name, request.userId);
            const docRef = doc(db, 'groups', groupId, 'requests', request.id);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const rejectRequest = async (requestId: string) => {
        if (!groupId) return;
        try {
            const docRef = doc(db, 'groups', groupId, 'requests', requestId);
            await deleteDoc(docRef);
        } catch (e) { console.error(e); throw e; }
    };

    const toggleMemberExempt = async (id: string, isExempt: boolean) => {
        if (!groupId) return;
        try {
            const docRef = doc(db, 'groups', groupId, 'members', id);
            await updateDoc(docRef, { isExempt });
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
        toggleMemberExempt
    };
}

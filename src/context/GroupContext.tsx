import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, writeBatch, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { Group } from '../types';

interface GroupContextType {
    groups: Group[];
    currentGroup: Group | null;
    selectGroup: (group: Group | null) => void;
    createGroup: (name: string) => Promise<void>;
    joinGroupByCode: (code: string) => Promise<boolean>;
    loadGroupForVisitor: (code: string) => Promise<boolean>;
    isLoading: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setGroups([]);
            setCurrentGroup(null);
            setIsLoading(false);
            return;
        }

        // Query groups where user is owner
        const ownerQuery = query(collection(db, 'groups'), where('ownerId', '==', user.uid));

        // Query groups where user is a member
        const memberQuery = query(collection(db, 'groups'), where('memberUids', 'array-contains', user.uid));

        const unsubscribeOwner = onSnapshot(ownerQuery, (snapshot) => {
            const ownerGroups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Group[];

            // We need to combine with member groups. 
            // Since we can't easily wait for both snapshots in a single sync hook without complexity,
            // we'll use a local state merger or just two listeners updating the same state.
            // For simplicity, let's just use a second listener.

            setGroups(prev => {
                const others = prev.filter(g => g.ownerId !== user.uid);
                return [...ownerGroups, ...others];
            });
            setIsLoading(false);
        });

        const unsubscribeMember = onSnapshot(memberQuery, (snapshot) => {
            const memberGroups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Group[];

            setGroups(prev => {
                const owned = prev.filter(g => g.ownerId === user.uid);
                // Avoid duplicates if user is both owner and member (shouldn't happen but good to be safe)
                const uniqueMembers = memberGroups.filter(mg => !owned.find(og => og.id === mg.id));
                return [...owned, ...uniqueMembers];
            });
        });

        return () => {
            unsubscribeOwner();
            unsubscribeMember();
        };
    }, [user]);

    const createGroup = async (name: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const newGroupId = doc(collection(db, 'groups')).id;

            // Generate simple 6-char code
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const newGroup: Group = {
                id: newGroupId,
                ownerId: user.uid,
                name: name,
                createdAt: Date.now(),
                memberUids: [user.uid],
                inviteCode: code
            };

            const batch = writeBatch(db);
            const groupRef = doc(db, 'groups', newGroupId);
            const inviteRef = doc(db, 'invites', code);

            batch.set(groupRef, newGroup);
            batch.set(inviteRef, { groupId: newGroupId });

            await batch.commit();

            // Wait a bit for sync
            setTimeout(() => {
                selectGroup(newGroup);
            }, 500);

        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const joinGroupByCode = async (code: string) => {
        if (!user) return false;
        setIsLoading(true);
        try {
            // 1. Lookup code
            const inviteRef = doc(db, 'invites', code.toUpperCase());
            const inviteSnap = await getDoc(inviteRef);

            if (!inviteSnap.exists()) {
                alert("Código inválido");
                return false;
            }

            const groupId = inviteSnap.data().groupId;

            // 2. Add user to group memberUids
            const groupRef = doc(db, 'groups', groupId);
            await updateDoc(groupRef, {
                memberUids: arrayUnion(user.uid)
            });

            return true;
        } catch (error) {
            console.error("Error joining group:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const loadGroupForVisitor = async (code: string) => {
        setIsLoading(true);
        try {
            const inviteRef = doc(db, 'invites', code.toUpperCase());
            const inviteSnap = await getDoc(inviteRef);

            if (!inviteSnap.exists()) {
                alert("Código inválido");
                return false;
            }

            const groupId = inviteSnap.data().groupId;
            const groupRef = doc(db, 'groups', groupId);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                setCurrentGroup(groupSnap.data() as Group);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error loading visitor group:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const selectGroup = (group: Group | null) => {
        setCurrentGroup(group);
    };

    return (
        <GroupContext.Provider value={{
            groups,
            currentGroup,
            selectGroup,
            createGroup,
            isLoading,
            joinGroupByCode,
            loadGroupForVisitor
        }}>
            {children}
        </GroupContext.Provider>
    );
}

export function useGroups() {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupProvider');
    }
    return context;
}

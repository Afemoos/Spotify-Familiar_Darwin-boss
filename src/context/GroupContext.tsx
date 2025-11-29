import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { Group } from '../types';

interface GroupContextType {
    groups: Group[];
    currentGroup: Group | null;
    selectGroup: (group: Group) => void;
    createGroup: (name: string) => Promise<void>;
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

        // Note: Querying where user is a member is harder in Firestore without an array field.
        // For now, we'll focus on Owned Groups. 
        // To support "Joined Groups", we'd ideally duplicate "memberUids" array on the Group doc
        // or query all groups and filter client-side (bad for scale) or use a separate "user_groups" collection.
        // Let's stick to Owner for MVP creation, and maybe hardcode the legacy group for Darwin.

        const unsubscribe = onSnapshot(ownerQuery, (snapshot) => {
            const loadedGroups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Group[];
            setGroups(loadedGroups);

            // Auto-select if only one group and none selected
            if (loadedGroups.length === 1 && !currentGroup) {
                setCurrentGroup(loadedGroups[0]);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createGroup = async (name: string) => {
        if (!user) return;
        try {
            const newGroupRef = doc(collection(db, 'groups'));
            const newGroup: Group = {
                id: newGroupRef.id,
                ownerId: user.uid,
                name: name,
                createdAt: Date.now()
            };
            await setDoc(newGroupRef, newGroup);
            setCurrentGroup(newGroup);
        } catch (error) {
            console.error("Error creating group:", error);
            throw error;
        }
    };

    const selectGroup = (group: Group) => {
        setCurrentGroup(group);
    };

    return (
        <GroupContext.Provider value={{ groups, currentGroup, selectGroup, createGroup, isLoading }}>
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

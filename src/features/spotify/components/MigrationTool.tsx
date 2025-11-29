import { useState } from 'react';
import { collection, getDocs, doc, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import { db, APP_ID } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';

export function MigrationTool() {
    const { user } = useAuth();
    const [status, setStatus] = useState<string>('');
    const [isMigrating, setIsMigrating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Only Darwin can see this
    if (user?.email !== 'darwin47@elprivado.app') return null;

    const migrateData = async () => {
        setIsMigrating(true);
        setStatus('Starting migration...');
        try {
            // 1. Create Group
            const groupRef = doc(db, 'groups', 'darwin-legacy');
            await setDoc(groupRef, {
                id: 'darwin-legacy',
                ownerId: user.uid, // Use current user's UID
                name: 'Familia Darwin',
                createdAt: Date.now()
            }, { merge: true });

            const batch = writeBatch(db);

            // 2. Migrate Members
            const membersRef = collection(db, 'apps', APP_ID, 'members');
            const membersSnap = await getDocs(membersRef);
            membersSnap.forEach(d => {
                const newRef = doc(db, 'groups', 'darwin-legacy', 'members', d.id);
                batch.set(newRef, d.data());
            });

            // 3. Migrate Payments
            const paymentsRef = collection(db, 'apps', APP_ID, 'payments');
            const paymentsSnap = await getDocs(paymentsRef);
            paymentsSnap.forEach(d => {
                const newRef = doc(db, 'groups', 'darwin-legacy', 'payments', d.id);
                batch.set(newRef, d.data());
            });

            // 4. Migrate Requests
            const requestsRef = collection(db, 'apps', APP_ID, 'requests');
            const requestsSnap = await getDocs(requestsRef);
            requestsSnap.forEach(d => {
                const newRef = doc(db, 'groups', 'darwin-legacy', 'requests', d.id);
                batch.set(newRef, d.data());
            });

            await batch.commit();
            setStatus('Migration completed successfully!');
        } catch (error) {
            console.error(error);
            setStatus(`Error: ${error}`);
        } finally {
            setIsMigrating(false);
        }
    };

    const syncAccess = async () => {
        if (!user) return;
        setIsSyncing(true);
        setStatus('Sincronizando accesos...');
        try {
            const legacyGroupId = 'darwin-legacy';
            const membersRef = collection(db, 'groups', legacyGroupId, 'members');
            const snapshot = await getDocs(membersRef);

            const memberUids: string[] = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.userId) {
                    memberUids.push(data.userId);
                }
            });

            // Add owner (Darwin - current user)
            if (user.uid && !memberUids.includes(user.uid)) {
                memberUids.push(user.uid);
            }

            // Generate Code if not exists
            const groupRef = doc(db, 'groups', legacyGroupId);
            const groupSnap = await getDoc(groupRef);
            let inviteCode = groupSnap.data()?.inviteCode;

            const batch = writeBatch(db);

            if (!inviteCode) {
                inviteCode = 'DARWIN'; // Fixed code for legacy
                batch.set(doc(db, 'invites', inviteCode), { groupId: legacyGroupId });
            }

            batch.update(groupRef, {
                memberUids: memberUids,
                inviteCode: inviteCode
            });

            await batch.commit();
            setStatus(`Sincronización completada. ${memberUids.length} miembros actualizados. Código: ${inviteCode}`);
        } catch (error) {
            console.error(error);
            setStatus('Error en sincronización: ' + error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-xl max-w-sm">
                <h3 className="font-bold text-white mb-2">Admin Tools</h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={migrateData}
                        disabled={isMigrating}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                    >
                        {isMigrating ? 'Migrating...' : 'Run Migration (Legacy -> Groups)'}
                    </button>

                    <button
                        onClick={syncAccess}
                        disabled={isSyncing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Access & Generate Code'}
                    </button>
                </div>
                {status && (
                    <p className="mt-2 text-xs text-gray-400 break-words">
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
}

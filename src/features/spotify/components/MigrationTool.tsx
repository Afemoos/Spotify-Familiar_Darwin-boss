import { useState } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, APP_ID } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';

export function MigrationTool() {
    const { user } = useAuth();
    const [status, setStatus] = useState('Ready');
    const [isLoading, setIsLoading] = useState(false);

    const migrateData = async () => {
        if (!user) return;
        setIsLoading(true);
        setStatus('Starting migration...');

        try {
            const batch = writeBatch(db);
            const legacyGroupId = 'darwin-legacy';

            // 1. Create Group Document
            const groupRef = doc(db, 'groups', legacyGroupId);
            batch.set(groupRef, {
                id: legacyGroupId,
                ownerId: user.uid, // Assuming current user is Darwin
                name: 'Familia Darwin',
                createdAt: Date.now()
            });

            // 2. Migrate Members
            const oldMembersRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_members');
            const membersSnap = await getDocs(oldMembersRef);
            membersSnap.forEach(docSnap => {
                const newDocRef = doc(db, 'groups', legacyGroupId, 'members', docSnap.id);
                batch.set(newDocRef, docSnap.data());
            });
            setStatus(`Prepared ${membersSnap.size} members...`);

            // 3. Migrate Payments
            const oldPaymentsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_payments');
            const paymentsSnap = await getDocs(oldPaymentsRef);
            paymentsSnap.forEach(docSnap => {
                const newDocRef = doc(db, 'groups', legacyGroupId, 'payments', docSnap.id);
                batch.set(newDocRef, docSnap.data());
            });
            setStatus(`Prepared ${paymentsSnap.size} payments...`);

            // 4. Migrate Requests
            const oldRequestsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'spotify_requests');
            const requestsSnap = await getDocs(oldRequestsRef);
            requestsSnap.forEach(docSnap => {
                const newDocRef = doc(db, 'groups', legacyGroupId, 'requests', docSnap.id);
                batch.set(newDocRef, docSnap.data());
            });
            setStatus(`Prepared ${requestsSnap.size} requests...`);

            // Commit Batch
            await batch.commit();
            setStatus('Migration Complete! Data copied to groups/darwin-legacy');

        } catch (error) {
            console.error(error);
            setStatus(`Error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.email !== 'darwin47@elprivado.app') return null;

    return (
        <div className="fixed bottom-4 right-4 bg-gray-900 p-4 rounded-xl border border-white/10 z-50">
            <h3 className="text-white font-bold mb-2">Migration Tool</h3>
            <p className="text-gray-400 text-xs mb-4">{status}</p>
            <button
                onClick={migrateData}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
                {isLoading ? 'Migrating...' : 'Start Migration'}
            </button>
        </div>
    );
}

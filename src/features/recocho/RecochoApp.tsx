import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecocho } from '../../hooks/useRecocho';
import { Landing } from './components/Landing';
import { CreateGame } from './components/CreateGame';
import { GameRoom } from './components/GameRoom';
import { ManageGames } from './components/ManageGames';

interface RecochoAppProps {
    onBackToHub: () => void;
}

type ViewState = 'landing' | 'create' | 'manage' | 'room';

export function RecochoApp({ onBackToHub }: RecochoAppProps) {
    const { user } = useAuth();
    const {
        activeGames,
        myGames,
        currentGame,
        createGame,
        joinGame,
        addPlayer,
        removePlayer,
        updatePitchPrice,
        deleteGame,
        setCurrentGame
    } = useRecocho();

    const [view, setView] = useState<ViewState>('landing');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateGame = async (teamSize: number, pitchPrice: number) => {
        setIsCreating(true);
        const gameId = await createGame({ teamSize, pitchPrice });
        setIsCreating(false);

        if (gameId) {
            setView('manage');
        }
    };

    // Effect to switch to room view if currentGame is set
    if (currentGame && view !== 'room') {
        setView('room');
    }

    const handleLeaveRoom = () => {
        setCurrentGame(null);
        setView('landing');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-slate-900 text-white p-4 md:p-6 overflow-y-auto">
            {view !== 'room' && (
                <button
                    onClick={onBackToHub}
                    className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 md:mb-8 transition-colors md:absolute md:top-6 md:left-6 z-10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Hub
                </button>
            )}

            <div className="max-w-6xl mx-auto pt-12">
                {view === 'landing' && (
                    <Landing
                        onCreateClick={() => setView('create')}
                        onManageClick={() => setView('manage')}
                        onJoinClick={() => setView('manage')}
                    />
                )}

                {view === 'create' && (
                    <CreateGame
                        onCreate={handleCreateGame}
                        onCancel={() => setView('landing')}
                        isCreating={isCreating}
                    />
                )}

                {view === 'manage' && (
                    <ManageGames
                        activeGames={activeGames}
                        myGames={myGames}
                        onJoinGame={joinGame}
                        onBack={() => setView('landing')}
                    />
                )}

                {view === 'room' && currentGame && (
                    <GameRoom
                        game={currentGame}
                        onAddPlayer={(name, team) => addPlayer(currentGame.id, name, team)}
                        onRemovePlayer={(playerId) => removePlayer(currentGame.id, playerId)}
                        onUpdatePrice={(price) => updatePitchPrice(currentGame.id, price)}
                        onDelete={async () => {
                            await deleteGame(currentGame.id);
                            setView('landing');
                        }}
                        onLeave={handleLeaveRoom}
                        currentUserId={user?.uid}
                    />
                )}
            </div>
        </div>
    );
}

// Default export for lazy loading
export default RecochoApp;

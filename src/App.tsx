import { useState } from 'react';
import { Hub } from './components/Hub';
import { apps } from './config/apps';

export default function App() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  if (!selectedAppId) {
    return <Hub onSelectApp={setSelectedAppId} />;
  }

  const SelectedApp = apps.find(app => app.id === selectedAppId)?.component;

  if (SelectedApp) {
    return <SelectedApp onBackToHub={() => setSelectedAppId(null)} />;
  }

  return null;
}
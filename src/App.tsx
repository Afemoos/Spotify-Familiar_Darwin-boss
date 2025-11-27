import { useState } from 'react';
import { Hub } from './components/Hub';
import { SpotifyApp } from './components/SpotifyApp';

export default function App() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (!selectedApp) {
    return <Hub onSelectApp={setSelectedApp} />;
  }

  if (selectedApp === 'spotify') {
    return <SpotifyApp />;
  }

  return null;
}
import { SpotifyApp } from '../components/SpotifyApp';

export interface AppConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    component: React.ComponentType<{ onBackToHub: () => void }>;
}

export const apps: AppConfig[] = [
    {
        id: 'spotify',
        name: 'Spotify Familiar',
        description: 'Gestión de pagos y miembros del plan familiar de Spotify.',
        icon: '/spotify-icon.jpg',
        component: SpotifyApp
    }
];

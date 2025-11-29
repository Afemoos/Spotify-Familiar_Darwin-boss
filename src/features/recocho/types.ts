export interface RecochoPlayer {
    id: string;
    name: string;
    isGuest: boolean;
    team: 'A' | 'B';
    addedAt: number;
    phoneNumber?: string;
    status: 'confirmed' | 'suggested';
    level?: number; // 1-10
}

export interface RecochoGame {
    id: string;
    code: string;
    adminCode: string;
    recoveryPin?: string; // Optional PIN for recovery
    location?: string; // Optional location name
    createdAt: number;
    teamSize: number; // 5 to 11
    pitchPrice: number;
    players: RecochoPlayer[];
    createdBy: string;
    status: 'active' | 'finished';
}

export interface CreateRecochoParams {
    teamSize: number;
    pitchPrice: number;
    creatorName?: string; // For guest creators
    recoveryPin?: string;
    location?: string;
}

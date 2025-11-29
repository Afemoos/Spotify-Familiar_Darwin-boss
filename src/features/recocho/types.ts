export interface RecochoPlayer {
    id: string;
    name: string;
    isGuest: boolean;
    team: 'A' | 'B';
    addedAt: number;
    phoneNumber?: string;
    status: 'confirmed' | 'suggested';
}

export interface RecochoGame {
    id: string;
    code: string;
    adminCode: string;
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
}

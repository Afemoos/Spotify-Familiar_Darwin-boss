export interface Member {
    id: string;
    name: string;
    createdAt: number;
    userId?: string;
    isExempt?: boolean;
}

export interface PaymentData {
    date: string;
    name: string;
}

export interface ReportRow {
    id: string;
    key: string;
    name: string;
    isPaid: boolean;
    date: string | null;
    isExMember: boolean;
}

export interface Request {
    id: string;
    name: string;
    createdAt: number;
    status: 'pending' | 'accepted' | 'rejected';
    userId?: string;
}

export interface Group {
    id: string;
    ownerId: string;
    name: string;
    createdAt: number;
    memberUids?: string[]; // Array of UIDs of members who have access
    inviteCode?: string; // 6-character unique code for joining/viewing
}

export type UserRole = 'admin' | 'member' | 'visitor';

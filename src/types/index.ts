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
}

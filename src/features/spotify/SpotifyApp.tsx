import { useState } from 'react';
import { useSpotifyData } from './hooks/useSpotifyData';
import { useAuth } from '../../context/AuthContext';
import { MobileLayout } from './components/MobileLayout';
import { DesktopLayout } from './components/DesktopLayout';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SpotifyAppProps {
    onBackToHub: () => void;
}

export function SpotifyApp({ onBackToHub }: SpotifyAppProps) {
    const { user: globalUser } = useAuth();
    const { members, payments, addMember, removeMember, markAsPaid, undoPayment, deleteHistorical, requests, acceptRequest, rejectRequest, toggleMemberExempt } = useSpotifyData();
    const [activeTab, setActiveTab] = useState(1);
    const [currentDate, setCurrentDate] = useState(new Date());
    const isMobile = useIsMobile();

    // Role determination
    const isAdmin = globalUser && (
        globalUser.email === 'darwin47@elprivado.app'
    );

    const role: 'admin' | 'member' | 'visitor' = isAdmin ? 'admin' : (globalUser ? 'member' : 'visitor');

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const selectSpecificMonth = (monthIndex: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(monthIndex);
        setCurrentDate(newDate);
    };

    const commonProps = {
        user: globalUser,
        members,
        payments,
        activeTab,
        setActiveTab,
        currentDate,
        changeMonth,
        selectSpecificMonth,
        addMember,
        removeMember,
        markAsPaid,
        undoPayment,
        deleteHistorical,
        role,
        onLogout: onBackToHub,
        requests,
        onAcceptRequest: acceptRequest,
        onRejectRequest: rejectRequest,
        onToggleExempt: toggleMemberExempt
    };

    return isMobile ? (
        <MobileLayout {...commonProps} />
    ) : (
        <DesktopLayout {...commonProps} />
    );
}

import { useState } from 'react';
import { useSpotifyData } from '../../hooks/useSpotifyData';
import { useAuth } from '../../context/AuthContext';
import { useGroups } from '../../context/GroupContext';
import { MobileLayout } from './components/MobileLayout';
import { DesktopLayout } from './components/DesktopLayout';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SpotifyAppProps {
    onBackToHub: () => void;
}

export function SpotifyApp({ onBackToHub }: SpotifyAppProps) {
    const { user: globalUser } = useAuth();
    const { currentGroup } = useGroups();
    const { members, payments, addMember, removeMember, markAsPaid, undoPayment, deleteHistorical, requests, requestSpot, acceptRequest, rejectRequest, toggleMemberExempt } = useSpotifyData(currentGroup?.id);
    const [activeTab, setActiveTab] = useState(1);
    const [currentDate, setCurrentDate] = useState(new Date());
    const isMobile = useIsMobile();

    // Role determination
    const isAdmin = globalUser && (
        globalUser.email === 'darwin47@elprivado.app'
    );

    const role: 'admin' | 'member' | 'visitor' = isAdmin ? 'admin' : (globalUser ? 'member' : 'visitor');

    // Display Invite Code for Admins
    if (role === 'admin' && currentGroup?.inviteCode) {
        // We can pass this to the layout or display it here. 
        // For now, let's pass it to the layouts.
    }

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
        onRequestSpot: requestSpot,
        onAcceptRequest: acceptRequest,
        onRejectRequest: rejectRequest,
        onToggleExempt: toggleMemberExempt,
        inviteCode: currentGroup?.inviteCode
    };

    return isMobile ? (
        <MobileLayout {...commonProps} />
    ) : (
        <DesktopLayout {...commonProps} />
    );
}

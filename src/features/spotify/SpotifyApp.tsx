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
    const { members, payments, isLoading, addMember, removeMember, markAsPaid, undoPayment, deleteHistorical, requests, acceptRequest, rejectRequest, toggleMemberExempt } = useSpotifyData();
    const [activeTab, setActiveTab] = useState(1);
    const [currentDate, setCurrentDate] = useState(new Date());
    const isMobile = useIsMobile();

    // Admin check: only Darwin47 is admin
    const isAdmin = globalUser && (
        globalUser.email === 'darwin47@elprivado.app' ||
        globalUser.uid === 'darwin47-admin-bypass'
    );

    // Visitor mode: if no user is logged in OR user is not admin
    const isVisitor = !isAdmin;

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

    if (isLoading && !globalUser && !isVisitor) {
        // This condition might need adjustment. If visitor, we don't wait for user.
        // But we might wait for data. useSpotifyData handles data loading.
        // If isVisitor, we just show the app.
    }

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
        isGuest: isVisitor, // Reusing isGuest prop for visitor mode
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

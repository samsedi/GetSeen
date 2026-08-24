import { useState, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { clearCache } from '@/api/cacheService';

import { OwnerBooking } from '@/api/ownerBookingService';
import { useOwnerBookingStore } from '@/store/useOwnerBookingStore';
import { ScreenItem } from '@/components/ScreenOwnerComponents/DashboardComponents/ScreenCard';

import { useOwnerScreenStore } from '@/store/useOwnerScreenStore';
import { OwnerScreenResponse } from '@/api/ownerScreenService';
import { useOwnerWalletStore } from '@/store/useOwnerWalletStore';
import { useOwnerDashboardStore } from '@/store/useOwnerDashboardStore';

export type DashboardTab = 'ACTIVE' | 'DRAFTS';

export interface DashboardOverviewStats {
    activeScreens: number;
    totalEarnings: string;
    totalPaid: string;
    pendingPayout: string;
}

// --------------------------------------------------------------------------
// Pure Mappers
// --------------------------------------------------------------------------
// Drafts aren't a separate resource — they're screens with status "draft"
// returned by the same /screen-owner/screens list.
const mapActiveScreen = (s: OwnerScreenResponse): ScreenItem => ({
    id: String(s?.id || ''),
    name: s?.title || 'Untitled Screen',
    status: s?.status === 'draft' ? 'Draft' : s?.status === 'online' ? 'Online' : 'Offline',
    location: s?.address || 'No location set',
    resolution: s?.dimensions || 'TBD',
    activeAds: 0,
    images: s?.primary_image_url ? [s.primary_image_url] : [],
    verificationStatus: s?.status === 'draft' ? 'DRAFT' : s?.review === 'approved' ? 'APPROVED' : 'PENDING',
});

// --------------------------------------------------------------------------
// Stat Calculation Helpers
// --------------------------------------------------------------------------
// Deleted calculateBookingStats

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------
export function useDashboard() {
    // Zustand stores
    const { screens: ownerScreens, fetchScreens, refreshScreens: refreshZustandScreens, loading: screensLoading, refreshing: screensRefreshing } = useOwnerScreenStore();
    const { bookings, fetchBookings, refreshBookings } = useOwnerBookingStore();
    const { earnings, fetchEarnings, refreshWallet } = useOwnerWalletStore();
    const { dashboardData, fetchDashboard } = useOwnerDashboardStore();
    
    const [loadingSecondary, setLoadingSecondary] = useState(true);
    const [refreshingSecondary, setRefreshingSecondary] = useState(false);
    const [activeTab, setActiveTab] = useState<DashboardTab>('ACTIVE');

    const hasFetchedInitially = useRef(false);

    const onRefresh = useCallback(async () => {
        setRefreshingSecondary(true);
        clearCache('campaigns_owner'); // Left over cache clear if needed elsewhere

        await Promise.all([
            refreshZustandScreens(),
            refreshBookings(),
            refreshWallet(),
            fetchDashboard(true),
        ]);

        setRefreshingSecondary(false);
    }, [refreshZustandScreens, refreshBookings, refreshWallet, fetchDashboard]);

    const fetchAllData = useCallback(async (showSpinner = true) => {
        if (showSpinner) {
            setLoadingSecondary(true);
        }

        await Promise.all([
            fetchScreens({ forceRefresh: showSpinner }),
            fetchBookings({ forceRefresh: showSpinner }),
            fetchEarnings(showSpinner),
            fetchDashboard(showSpinner),
        ]);

        setLoadingSecondary(false);
    }, [fetchScreens, fetchBookings, fetchEarnings, fetchDashboard]);

    useFocusEffect(
        useCallback(() => {
            if (!hasFetchedInitially.current) {
                fetchAllData(true);
                hasFetchedInitially.current = true;
            } else {
                fetchAllData(false);
            }
        }, [fetchAllData])
    );

    const [searchQuery, setSearchQuery] = useState('');

    const allScreens = useMemo(() => {
        const validScreens = (ownerScreens || []).filter(s => s !== null && s !== undefined);
        return validScreens.map(mapActiveScreen);
    }, [ownerScreens]);

    // Calculate dynamic stats
    const stats = useMemo(() => {
        const formatAmount = (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return {
            totalEarnings: formatAmount(dashboardData?.earnings?.total_earnings || 0),
            totalPaid: formatAmount(dashboardData?.earnings?.total_paid || 0),
            pendingPayout: formatAmount(dashboardData?.earnings?.pending_payout || 0),
            activeScreens: dashboardData?.screens?.active || 0
        };
    }, [dashboardData]);

    const displayedScreens = useMemo(() => {
        let result = allScreens;
        
        if (activeTab === 'DRAFTS') {
            result = result.filter((s) => s.status === 'Draft');
        } else {
            result = result.filter((s) => s.status !== 'Draft');
        }

        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter((item) => {
                const name = item.name?.toLowerCase() || '';
                const loc = item.location?.toLowerCase() || '';
                return name.includes(lowerQuery) || loc.includes(lowerQuery);
            });
        }

        return result;
    }, [allScreens, activeTab, searchQuery]);

    const loading = screensLoading || loadingSecondary;
    const refreshing = screensRefreshing || refreshingSecondary;

    return {
        screens: allScreens,
        displayedScreens,
        stats,
        onboarding: dashboardData?.onboarding,
        loading,
        activeTab,
        setActiveTab,
        fetchAllScreens: fetchAllData,
        searchQuery,
        setSearchQuery,
        refreshing,
        onRefresh
    };
}

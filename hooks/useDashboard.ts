import { useState, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { clearCache } from '@/api/cacheService';

import screenApi, { ScreenResponseDto, ScreenDraftResponseDto } from '@/api/screenService';
import { fetchOwnerBookings, CampaignData } from '@/api/campaignService';
import { ScreenItem } from '@/components/ScreenOwnerComponents/DashboardComponents/ScreenCard';

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
const mapActiveScreen = (s: ScreenResponseDto): ScreenItem => ({
    id: s.id,
    name: s.name,
    status: s.active ? 'Online' : 'Offline',
    location: s.address || 'No location set',
    resolution: s.resolution || 'TBD',
    activeAds: 0,
    images: s.mediaUrls && s.mediaUrls.length > 0 ? s.mediaUrls : [],
    verificationStatus: s.verificationStatus || 'PENDING',
});

const mapDraftScreen = (d: ScreenDraftResponseDto): ScreenItem => ({
    id: d.id,
    name: d.name || 'Untitled Draft',
    status: 'Draft',
    location: d.address || 'Location pending',
    resolution: d.resolution || 'TBD',
    activeAds: 0,
    images: d.mediaUrls && d.mediaUrls.length > 0 ? d.mediaUrls : [],
    verificationStatus: 'DRAFT',
});

// --------------------------------------------------------------------------
// Isolated Try/Catch Fetcher
// --------------------------------------------------------------------------
const fetchDashboardDataSafely = async (): Promise<{ screens: ScreenItem[], stats: DashboardOverviewStats }> => {
    try {
        const [activeData, draftData, campaignsData] = await Promise.all([
            screenApi.getMyScreens(),
            screenApi.getMyDrafts(),
            fetchOwnerBookings(),
        ]);

        const formattedActive = activeData.map(mapActiveScreen);
        const formattedDrafts = draftData.map(mapDraftScreen);
        const allScreens = [...formattedActive, ...formattedDrafts];

        const activeScreensCount = activeData.filter(s => s.active).length;
        
        let rawEarnings = 0;
        let rawPaid = 0;

        // Same weekly logic as the wallet: A week's earnings are paid if all its campaigns are COMPLETED.
        const weeklyMap = new Map<string, { earnings: number, allCompleted: boolean }>();

        campaignsData.forEach(c => {
            if (c.status === 'REJECTED') return;
            
            rawEarnings += (c.pricePaid || 0);

            const date = new Date(c.endDate);
            if (isNaN(date.getTime())) return;

            const day = date.getDay();
            const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date.getTime());
            monday.setDate(diffToMonday);
            
            const screenId = c.screen?.id;
            const weekKey = `${screenId}-${monday.toISOString().split('T')[0]}`;

            if (!weeklyMap.has(weekKey)) {
                weeklyMap.set(weekKey, { earnings: 0, allCompleted: true });
            }

            const weekData = weeklyMap.get(weekKey)!;
            weekData.earnings += (c.pricePaid || 0);
            if (c.status !== 'COMPLETED') {
                weekData.allCompleted = false;
            }
        });

        // Sum up the paid weeks
        Array.from(weeklyMap.values()).forEach(weekData => {
            if (weekData.allCompleted) {
                rawPaid += weekData.earnings;
            }
        });

        const rawPending = rawEarnings - rawPaid;

        const formatAmount = (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        return {
            screens: allScreens,
            stats: {
                activeScreens: activeScreensCount,
                totalEarnings: formatAmount(rawEarnings),
                totalPaid: formatAmount(rawPaid),
                pendingPayout: formatAmount(rawPending)
            }
        };
    } catch (error) {
        console.log('Failed to fetch dashboard data:', error);
        return {
            screens: [],
            stats: {
                activeScreens: 0,
                totalEarnings: '₦0.00',
                totalPaid: '₦0.00',
                pendingPayout: '₦0.00'
            }
        };
    }
};

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------
export function useDashboard() {
    const [screens, setScreens] = useState<ScreenItem[]>([]);
    const [stats, setStats] = useState<DashboardOverviewStats>({
        activeScreens: 0,
        totalEarnings: '₦0.00',
        totalPaid: '₦0.00',
        pendingPayout: '₦0.00'
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<DashboardTab>('ACTIVE');

    const hasFetchedInitially = useRef(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        clearCache('screens_my');
        clearCache('campaigns_owner');
        // Drafts don't have caching implemented currently, but safe to fetch
        const data = await fetchDashboardDataSafely();
        setScreens(data.screens);
        setStats(data.stats);
        setRefreshing(false);
    }, []);

    const fetchAllScreens = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);

        const data = await fetchDashboardDataSafely();
        setScreens(data.screens);
        setStats(data.stats);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!hasFetchedInitially.current) {
                fetchAllScreens(true);
                hasFetchedInitially.current = true;
            } else {
                fetchAllScreens(false);
            }
        }, [fetchAllScreens])
    );

    const [searchQuery, setSearchQuery] = useState('');

    const displayedScreens = useMemo(() => {
        let result = screens;
        
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
    }, [screens, activeTab, searchQuery]);

    return {
        screens,
        displayedScreens,
        stats,
        loading,
        activeTab,
        setActiveTab,
        fetchAllScreens,
        searchQuery,
        setSearchQuery,
        refreshing,
        onRefresh
    };
}

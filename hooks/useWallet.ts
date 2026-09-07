import { useState, useEffect, useMemo } from 'react';
import { useOwnerBookingStore } from '@/store/useOwnerBookingStore';
import { useOwnerWalletStore } from '@/store/useOwnerWalletStore';
import { OwnerEarnings, OwnerPayout } from '@/api/ownerWalletService';
import { isDateInFilter, TimeFilterPreset } from '@/utils/dateFilters';

export type WalletTab = 'earnings' | 'payouts';

export interface EarningsSummary {
    totalEarnings: string;
    totalPaid: string;
    pendingPayout: string;
    totalEarningsRaw: number;
}

export interface PayoutHistoryData {
    id: string;
    screenTitle: string;
    weekStart: string;
    weekEnd: string;
    totalCampaigns: number;
    earnings: string;
    rawEarnings: number;
    status: 'Paid' | 'Pending';
    expectedPayoutDate: string;
    actualPayoutDate: string | null;
    rawActualPayoutDate: string | null;
    rawWeekEnd: string;
}

export interface VenueEarningsData {
    venueName: string;
    totalCampaigns: number;
    pendingPayout: string;
    paidAmount: string;
    totalEarnings: string;
    lastPayoutDate: string | null;
    weeklyBreakdowns: PayoutHistoryData[];
}

export function useWallet() {
    const [activeTab, setActiveTab] = useState<WalletTab>('earnings');
    const [timeFilter, setTimeFilter] = useState<TimeFilterPreset>('All Time');
    const [loading, setLoading] = useState<boolean>(true);

    const { fetchBookings } = useOwnerBookingStore();
    const { earnings, payouts, fetchPayouts, fetchEarnings } = useOwnerWalletStore();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchBookings(),
                fetchPayouts({ per_page: 500 }),
                fetchEarnings()
            ]);
        } catch (error) {
            console.error("Failed to load data for wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    const earningsSummary: EarningsSummary = useMemo(() => mapEarningsToSummary(earnings), [earnings]);
    
    const payoutHistory: PayoutHistoryData[] = useMemo(() => payouts.map(mapPayoutToHistory), [payouts]);

    const filteredPayoutHistory = useMemo(() => {
        return payoutHistory.filter(p => {
            // Filter based on the end of the earnings week
            return isDateInFilter(p.rawWeekEnd, timeFilter);
        });
    }, [payoutHistory, timeFilter]);

    const venueEarnings: VenueEarningsData[] = useMemo(() => aggregateVenueEarnings(filteredPayoutHistory), [filteredPayoutHistory]);

    return {
        activeTab,
        setActiveTab,
        timeFilter,
        setTimeFilter,
        loading,
        earningsSummary,
        payoutHistory,
        venueEarnings,
    };
}

const mapEarningsToSummary = (earnings: OwnerEarnings | null): EarningsSummary => ({
    totalEarnings: formatAmount(earnings?.total_earnings || 0),
    totalPaid: formatAmount(earnings?.total_paid || 0),
    pendingPayout: formatAmount(earnings?.pending_payout || 0),
    totalEarningsRaw: earnings?.total_earnings || 0,
});

const mapPayoutToHistory = (p: OwnerPayout): PayoutHistoryData => ({
    id: String(p.id),
    screenTitle: p.screen_title,
    weekStart: formatDate(p.week_start),
    weekEnd: formatDate(p.week_end),
    totalCampaigns: p.total_campaigns,
    earnings: formatAmount(p.total_earnings, p.currency_symbol),
    rawEarnings: p.total_earnings || 0,
    status: p.status === 'paid' ? 'Paid' : 'Pending',
    expectedPayoutDate: formatDate(p.expected_payout_date),
    actualPayoutDate: p.payout_date ? formatDate(p.payout_date) : null,
    rawActualPayoutDate: p.payout_date || null,
    rawWeekEnd: p.week_end,
});

export function aggregateVenueEarnings(payouts: PayoutHistoryData[]): VenueEarningsData[] {
    const venueMap = new Map<string, VenueEarningsData>();

    payouts.forEach(payout => {
        if (!venueMap.has(payout.screenTitle)) {
            venueMap.set(payout.screenTitle, {
                venueName: payout.screenTitle,
                totalCampaigns: 0,
                pendingPayout: '₦0.00',
                paidAmount: '₦0.00',
                totalEarnings: '₦0.00',
                lastPayoutDate: null,
                weeklyBreakdowns: [],
            });
        }
        
        const v = venueMap.get(payout.screenTitle)!;
        v.weeklyBreakdowns.push(payout);
        v.totalCampaigns += payout.totalCampaigns;
        
        let pendingRaw = v.weeklyBreakdowns.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.rawEarnings, 0);
        let paidRaw = v.weeklyBreakdowns.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.rawEarnings, 0);
        
        v.pendingPayout = formatAmount(pendingRaw);
        v.paidAmount = formatAmount(paidRaw);
        v.totalEarnings = formatAmount(pendingRaw + paidRaw);

        const paidItems = v.weeklyBreakdowns.filter(p => p.status === 'Paid' && p.rawActualPayoutDate);
        if (paidItems.length > 0) {
            paidItems.sort((a, b) => new Date(b.rawActualPayoutDate!).getTime() - new Date(a.rawActualPayoutDate!).getTime());
            v.lastPayoutDate = paidItems[0].actualPayoutDate; 
        }
    });

    return Array.from(venueMap.values());
}

const formatAmount = (amount: number, currencySymbol = '₦'): string =>
    `${currencySymbol}${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

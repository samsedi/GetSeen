import { useState, useEffect } from 'react';
import { useOwnerBookingStore } from '@/store/useOwnerBookingStore';
import { useOwnerWalletStore } from '@/store/useOwnerWalletStore';
import { OwnerEarnings, OwnerPayout } from '@/api/ownerWalletService';

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
    status: 'Paid' | 'Pending';
    expectedPayoutDate: string;
    actualPayoutDate: string | null;
}

export function useWallet() {
    const [activeTab, setActiveTab] = useState<WalletTab>('earnings');
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
                fetchPayouts(),
                fetchEarnings()
            ]);
        } catch (error) {
            console.error("Failed to load data for wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    const earningsSummary: EarningsSummary = mapEarningsToSummary(earnings);
    const payoutHistory: PayoutHistoryData[] = payouts.map(mapPayoutToHistory);

    return {
        activeTab,
        setActiveTab,
        loading,
        earningsSummary,
        payoutHistory,
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
    status: p.status === 'paid' ? 'Paid' : 'Pending',
    expectedPayoutDate: formatDate(p.expected_payout_date),
    actualPayoutDate: p.payout_date ? formatDate(p.payout_date) : null,
});

const formatAmount = (amount: number, currencySymbol = '₦'): string =>
    `${currencySymbol}${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

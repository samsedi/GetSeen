import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { fetchProfile, ProfileData } from '@/api/profileService';
import { fetchOwnerBookings, CampaignData } from '@/api/campaignService';
import { useAlertStore } from '@/store/useAlertStore';

export type WalletTab = 'earnings' | 'payouts';

export interface VenueEarningData {
    id: string;
    venueName: string;
    location: string;
    totalCampaigns: number;
    pendingPayout: string;
    paidAmount: string;
    totalEarnings: string;
    lastPayout: string;
}

export interface PayoutHistoryData {
    id: string;
    venueName: string;
    weekStart: string;
    weekEnd: string;
    earnings: string;
    campaigns: number;
    status: string;
    expectedPayout: string;
    actualPayout: string;
}

export function useWallet() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<WalletTab>('earnings');
    const [loading, setLoading] = useState<boolean>(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [venueEarnings, setVenueEarnings] = useState<VenueEarningData[]>([]);
    const [payoutHistory, setPayoutHistory] = useState<PayoutHistoryData[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileData, campaignsData] = await Promise.all([
                fetchProfile('owner'),
                fetchOwnerBookings()
            ]);
            setProfile(profileData);
            processWalletData(campaignsData);
        } catch (error) {
            logError(error);
        } finally {
            setLoading(false);
        }
    };

    const processWalletData = (campaigns: CampaignData[]) => {
        setVenueEarnings(aggregateVenueEarnings(campaigns));
        setPayoutHistory(aggregateWeeklyPayouts(campaigns));
    };

    const aggregateVenueEarnings = (campaigns: CampaignData[]): VenueEarningData[] => {
        const venueMap = new Map<string, VenueEarningData>();

        campaigns.forEach(campaign => {
            const screenId = campaign.screen?.id;
            if (!screenId) return;

            const existing = venueMap.get(screenId) || createInitialVenueEarning(campaign);
            updateVenueEarning(existing, campaign);
            venueMap.set(screenId, existing);
        });

        return Array.from(venueMap.values());
    };

    const createInitialVenueEarning = (campaign: CampaignData): VenueEarningData => {
        const locationStr = [campaign.screen?.city, campaign.screen?.country].filter(Boolean).join(', ');
        return {
            id: campaign.screen.id,
            venueName: campaign.screen.name,
            location: locationStr || 'N/A',
            totalCampaigns: 0,
            pendingPayout: "₦0.00",
            paidAmount: "₦0.00",
            totalEarnings: "₦0.00",
            lastPayout: "N/A"
        };
    };

    const updateVenueEarning = (existing: VenueEarningData, campaign: CampaignData) => {
        existing.totalCampaigns += 1;
        
        const price = campaign.pricePaid || 0;
        const currentTotal = parseAmount(existing.totalEarnings);
        existing.totalEarnings = formatAmount(currentTotal + price);

        if (campaign.status === 'COMPLETED') {
            const currentPaid = parseAmount(existing.paidAmount);
            existing.paidAmount = formatAmount(currentPaid + price);
            existing.lastPayout = formatDate(campaign.endDate);
        } else {
            const currentPending = parseAmount(existing.pendingPayout);
            existing.pendingPayout = formatAmount(currentPending + price);
        }
    };

    const aggregateWeeklyPayouts = (campaigns: CampaignData[]): PayoutHistoryData[] => {
        const weeklyMap = new Map<string, any>();

        campaigns.forEach(c => {
            if (c.status === 'REJECTED') return;
            
            const date = new Date(c.endDate); // Group by when the campaign ends
            if (isNaN(date.getTime())) return;

            // Find Monday and Sunday of this date's week
            const day = date.getDay();
            const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(date.getTime());
            monday.setDate(diffToMonday);
            
            const sunday = new Date(monday.getTime());
            sunday.setDate(monday.getDate() + 6);

            const screenId = c.screen?.id;
            const weekKey = `${screenId}-${monday.toISOString().split('T')[0]}`;

            if (!weeklyMap.has(weekKey)) {
                weeklyMap.set(weekKey, {
                    id: weekKey,
                    venueName: c.screen?.name || 'Unknown Venue',
                    weekStartObj: monday,
                    weekEndObj: sunday,
                    totalEarnings: 0,
                    campaignCount: 0,
                    allCompleted: true
                });
            }

            const weekData = weeklyMap.get(weekKey);
            weekData.totalEarnings += (c.pricePaid || 0);
            weekData.campaignCount += 1;
            if (c.status !== 'COMPLETED') {
                weekData.allCompleted = false;
            }
        });

        return Array.from(weeklyMap.values()).map(weekData => {
            const expectedDate = new Date(weekData.weekEndObj.getTime());
            expectedDate.setDate(expectedDate.getDate() + 1); // Expected payout on Monday after the week ends
            
            return {
                id: weekData.id,
                venueName: weekData.venueName,
                weekStart: formatDate(weekData.weekStartObj.toISOString()),
                weekEnd: formatDate(weekData.weekEndObj.toISOString()),
                earnings: formatAmount(weekData.totalEarnings),
                campaigns: weekData.campaignCount,
                status: weekData.allCompleted ? 'Paid' : 'Pending',
                expectedPayout: formatDate(expectedDate.toISOString()),
                actualPayout: weekData.allCompleted ? formatDate(expectedDate.toISOString()) : 'Pending'
            };
        }).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    };

    const parseAmount = (formatted: string): number => {
        return parseFloat(formatted.replace(/[^0-9.-]+/g, "")) || 0;
    };

    const formatAmount = (amount: number): string => {
        return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const logError = (error: any) => {
        console.error("Failed to load data for wallet:", error);
    };

    const handleRequestPayout = () => {
        if (isBankDetailsMissing()) {
            promptUserToAddBankDetails();
            return;
        }
        confirmPayoutRequest();
    };

    const isBankDetailsMissing = (): boolean => {
        return !profile?.bankDetails && !profile?.accountNumber;
    };

    const promptUserToAddBankDetails = () => {
        useAlertStore.getState().showAlert(
            "Bank Details Required",
            "Please add your bank account details in your profile before requesting a payout."
        );
        router.push('/(screen-owner-tabs)/owner-profile');
    };

    const confirmPayoutRequest = () => {
        useAlertStore.getState().showAlert(
            "Payout Requested",
            "Your payout request is being processed and will arrive in your account shortly."
        );
    };

    return {
        activeTab,
        setActiveTab,
        loading,
        profile,
        venueEarnings,
        payoutHistory,
        handleRequestPayout
    };
}

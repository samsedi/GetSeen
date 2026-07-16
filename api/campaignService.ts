import client from './client';
import { getCached, clearCache } from './cacheService';

export interface CampaignData {
    id: string;
    accountId: string;
    screen: {
        id: string;
        name: string;
        location?: string;
        city?: string;
        country?: string;
        screenType?: string;
    };
    transactionReference: string;
    startDate: string;
    endDate: string;
    mediaUrl: string;
    pricePaid: number;
    status: 'PENDING' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'REJECTED';
    createdAt: string;
}

export const fetchMyCampaigns = async (): Promise<CampaignData[]> => {
    return getCached('campaigns_my', async () => {
        const response = await client.get('/campaigns');
        return response.data;
    });
};

export const fetchOwnerBookings = async (): Promise<CampaignData[]> => {
    return getCached('campaigns_owner', async () => {
        const response = await client.get('/campaigns/owner');
        return response.data;
    });
};

export interface DashboardStats {
    activeCampaigns: number;
    totalQrCodes: number;
    monthlySpend: number;
    totalSpend: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    return getCached('campaigns_dashboard', async () => {
        const response = await client.get('/campaigns/dashboard');
        return response.data;
    });
};

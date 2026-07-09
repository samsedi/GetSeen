import client from './client';

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
    const response = await client.get('/campaigns');
    return response.data;
};

export const fetchOwnerBookings = async (): Promise<CampaignData[]> => {
    const response = await client.get('/campaigns/owner');
    return response.data;
};

export interface DashboardStats {
    activeCampaigns: number;
    totalQrCodes: number;
    monthlySpend: number;
    totalSpend: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const response = await client.get('/campaigns/dashboard');
    return response.data;
};

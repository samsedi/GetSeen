import apiClient from './client';
import { PaginationMeta } from './ownerScreenService'; // Reusing pagination meta interface

export interface OwnerEarnings {
    total_earnings: number;
    total_paid: number;
    pending_payout: number;
}

export interface OwnerPayout {
    id: number | string;
    screen_id: number | string;
    screen_title: string;
    week_start: string;
    week_end: string;
    total_campaigns: number;
    total_earnings: number;
    expected_payout_date: string;
    payout_date: string | null;
    status: 'pending' | 'paid' | string;
    currency_symbol: string;
}

export interface OwnerEarningsResponse {
    success: boolean;
    data: {
        earnings: OwnerEarnings;
    };
}

export interface OwnerPayoutsResponse {
    success: boolean;
    data: {
        payouts: OwnerPayout[];
        pagination: PaginationMeta;
    };
}

export interface PayoutQueryParams {
    page?: number;
    per_page?: number;
    status?: string;
}

const ownerWalletApi = {
    fetchEarnings: async (): Promise<OwnerEarnings> => {
        const response = await apiClient.get<OwnerEarningsResponse>('/screen-owner/earnings');
        if (response.data && response?.data?.success && response?.data?.data) {
            return response?.data?.data?.earnings;
        }
        return { total_earnings: 0, total_paid: 0, pending_payout: 0 };
    },

    fetchPayouts: async (params?: PayoutQueryParams): Promise<{ payouts: OwnerPayout[], pagination: PaginationMeta | null }> => {
        const response = await apiClient.get<OwnerPayoutsResponse>('/screen-owner/payouts', { params });
        if (response.data && response?.data?.success && response?.data?.data) {
            return {
                payouts: response?.data?.data?.payouts || [],
                pagination: response?.data?.data?.pagination || null,
            };
        }
        return { payouts: [], pagination: null };
    }
};

export default ownerWalletApi;

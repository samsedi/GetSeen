import apiClient from './client';
import { PaginationMeta } from './advertiserScreenService';

// ─────────────────────────────────────────────────────────────
// Types

// ─────────────────────────────────────────────────────────────

export interface AmplifyMedia {
    filename: string;
    type: 'image' | 'video';
    url?: string;
}

export interface PreviousScreenCampaign {
    order_item_id: number;
    order_id: number;
    order_number: string;
    screen_id: number;
    screen_title: string;
    location: string;
    status: string;
    media: AmplifyMedia | null;
}

export interface AmplifyCampaign {
    id: number;
    display_name: string;
    campaign_display_name: string;
    campaign_type: string;
    status: string;
    status_display: string;
    impressions?: number;
    impressions_delivered?: number;
    clicks?: number;
    ctr?: number;
    conversions?: number;
    reach?: number;
    paid_price: number;
    start_date: string;
    end_date: string;
    destination_url?: string;
    screens: string[];
    screens_count: number;
    all_screens?: string[];
    media_preview?: any;
    media_files?: any[];
    source_orders?: any[];
    locations?: any[];
}

export interface AmplifyCheckoutRequest {
    campaign_name: string;
    order_item_ids: number[];
    start_date: string;
    end_date: string;
    daily_impressions: number;
    destination_url: string;
    media_files: AmplifyMedia[];
    coupon?: string;
    callback_url: string;
}

export interface AmplifyExtendRequest {
    extension_days: number;
    callback_url: string;
}

export interface AmplifyRelaunchRequest {
    start_date: string;
    end_date: string;
    daily_impressions?: number;
    callback_url: string;
}

export interface AmplifyAnalyticsResponse {
    campaign: any;
    summary: any;
    daily_stats: any[];
    locations: any[];
    apps: any[];
    leads?: any[];
}

const AMPLIFY_ROUTE = '/advertiser/amplify';

const amplifyApi = {
    getPreviousScreenCampaigns: async (page = 1, per_page = 10): Promise<{ campaigns: PreviousScreenCampaign[]; media: any[]; minimum_daily_impressions: number; price_per_impression: number; pagination: PaginationMeta }> => {
        const response = await apiClient.get<any>(`${AMPLIFY_ROUTE}/previous-screen-campaigns`, { params: { page, per_page } });
        return response?.data?.data;
    },

    checkoutAmplify: async (data: AmplifyCheckoutRequest): Promise<{ campaign: any; payment: any; paystack: any; message: string }> => {
        const response = await apiClient.post<any>(`${AMPLIFY_ROUTE}/checkout`, data);
        return response?.data?.data;
    },

    getCampaigns: async (params?: { page?: number; per_page?: number; status?: string; search?: string; sort?: string; date_range?: string; start_date?: string; end_date?: string }): Promise<{ campaigns: AmplifyCampaign[]; pagination: PaginationMeta }> => {
        const response = await apiClient.get<any>(`${AMPLIFY_ROUTE}/campaigns`, { params });
        return response?.data?.data;
    },

    getCampaignDetail: async (campaignId: number | string): Promise<AmplifyCampaign> => {
        const response = await apiClient.get<any>(`${AMPLIFY_ROUTE}/campaigns/${campaignId}`);
        return response?.data?.data?.campaign;
    },

    extendCampaign: async (campaignId: number | string, data: AmplifyExtendRequest): Promise<any> => {
        const response = await apiClient.post<any>(`${AMPLIFY_ROUTE}/campaigns/${campaignId}/extend`, data);
        return response?.data?.data;
    },

    relaunchCampaign: async (campaignId: number | string, data: AmplifyRelaunchRequest): Promise<any> => {
        const response = await apiClient.post<any>(`${AMPLIFY_ROUTE}/campaigns/${campaignId}/relaunch`, data);
        return response?.data?.data;
    },

    getAnalytics: async (campaignId: number | string, range: string = 'all', startDate?: string, endDate?: string): Promise<AmplifyAnalyticsResponse> => {
        const params: any = { range };
        if (range === 'custom' && startDate && endDate) {
            params.start_date = startDate;
            params.end_date = endDate;
        }
        const response = await apiClient.get<any>(`${AMPLIFY_ROUTE}/campaigns/${campaignId}/analytics`, { params });
        return response?.data?.data?.analytics;
    }
};

export default amplifyApi;

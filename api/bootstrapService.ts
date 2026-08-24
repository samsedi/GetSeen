import apiClient from './client';
import { UserDTO } from './authService';

export interface AppBootstrapData {
    user: UserDTO;
    dashboard: {
        orders_count?: number;
        active_orders_count?: number;
        completed_orders_count?: number;
        cart_items_count?: number;
        wishlist_items_count?: number;
        
        // Screen Owner Specific
        screens_count?: number;
        online_screens_count?: number;
        approved_screens_count?: number;
        total_earnings?: number;
        total_paid?: number;
        pending_payout?: number;
    };
    profile: {
        complete: boolean;
        incomplete: boolean;
    };
    features: {
        can_create_campaign: boolean;
        can_manage_screens: boolean;
        can_view_earnings: boolean;
        can_upload_media: boolean;
    };
    onboarding: {
        profile_complete: boolean;
    };
    notification_count: number;
}

export const fetchBootstrap = async (): Promise<AppBootstrapData> => {
    const response = await apiClient.get('/bootstrap');
    return response?.data?.data;
};

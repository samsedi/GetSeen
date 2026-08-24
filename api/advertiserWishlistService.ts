import apiClient from './client';
import { AdvertiserScreenDTO, mapAdvertiserScreenToAppScreen } from './advertiserScreenService';
import { ScreenResponseDto } from './screenService';

export interface WishlistStatusResponse {
    success: boolean;
    data: {
        screen_id: number | string;
        in_wishlist: boolean;
    };
}

export interface WishlistToggleResponse {
    success: boolean;
    data: {
        action: 'added' | 'removed';
        in_wishlist: boolean;
        screen_id: number | string;
        wishlist_item?: any;
    };
}

export interface WishlistItemDTO {
    id: number;
    screen_id: number;
    created_at: string;
    screen: AdvertiserScreenDTO;
}

export interface WishlistResponse {
    success: boolean;
    data: {
        wishlist: WishlistItemDTO[];
        pagination: any;
    };
}

const advertiserWishlistApi = {
    getWishlist: async (): Promise<ScreenResponseDto[]> => {
        const response = await apiClient.get<WishlistResponse>('/advertiser/wishlist?per_page=100');
        // Map the inner 'screen' object for each wishlist item
        return (response?.data?.data?.wishlist || []).map(item => mapAdvertiserScreenToAppScreen(item.screen));
    },

    checkStatus: async (screenId: string | number): Promise<boolean> => {
        const response = await apiClient.get<WishlistStatusResponse>(`/advertiser/wishlist/${screenId}`);
        return response?.data?.data?.in_wishlist;
    },

    toggleWishlist: async (screenId: string | number): Promise<WishlistToggleResponse> => {
        const response = await apiClient.post<WishlistToggleResponse>(`/advertiser/wishlist/${screenId}/toggle`);
        return response.data;
    }
};

export default advertiserWishlistApi;

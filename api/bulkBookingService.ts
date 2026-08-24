import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface BulkScreen {
    id: number;
    title: string;
    location: string;
    daily_price: number;
    weekly_price: number;
    monthly_price: number;
    min_booking_days: number;
}

export interface BulkFilterOption {
    id: number;
    name: string;
}

export interface BulkScreensResponse {
    screens: BulkScreen[];
    states: BulkFilterOption[];
    categories: BulkFilterOption[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        has_next: boolean;
    };
}

export interface BulkCartRequest {
    screen_ids: number[];
    duration: 'daily' | 'weekly' | 'monthly';
    duration_multiplier: number;
    start_date: string;
    end_date: string;
}

export interface BulkCartResponse {
    message: string;
    added_count: number;
    cart: any;
}

export type BulkSortOption = 'recommended' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc';

// ─────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────

const BULK_ROUTE = '/advertiser/bulk-screen-booking';

// ─────────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────────

const bulkBookingService = {
    /**
     * Fetches screens available for bulk booking.
     * Matches GET /advertiser/bulk-screen-booking/screens
     */
    getScreens: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        state_id?: number;
        category_id?: number;
        sort?: BulkSortOption;
    }): Promise<BulkScreensResponse> => {
        const response = await apiClient.get<{ success: boolean; data: BulkScreensResponse }>(
            `${BULK_ROUTE}/screens`,
            { params }
        );
        return response?.data?.data;
    },

    /**
     * Adds selected screens to the cart with shared scheduling.
     * Matches POST /advertiser/bulk-screen-booking/cart
     */
    addToCart: async (data: BulkCartRequest): Promise<BulkCartResponse> => {
        const response = await apiClient.post<{ success: boolean; data: BulkCartResponse }>(
            `${BULK_ROUTE}/cart`,
            data
        );
        return response?.data?.data;
    },
};

export default bulkBookingService;

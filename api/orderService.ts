import apiClient from './client';
import { PaginationMeta } from './advertiserScreenService';

// ─────────────────────────────────────────────────────────────
// Types (mirroring backend DTOs)
// ─────────────────────────────────────────────────────────────

export type OrderStatus = 'all' | 'pending' | 'scheduled' | 'approved' | 'cancelled' | 'rejected' | 'completed';

export interface OrderSummary {
    id: number;
    order_number: string;
    status: string;
    amount_paid: number;
    transaction_ref: string;
    created_at: string;
    updated_at: string;
    items_count: number;
    duration?: string;
    total_plays?: number;
}

export interface OrderItem {
    id: number;
    screen_id: number;
    screen_title: string;
    duration: string;
    media_type: string;
    start_date: string;
    end_date: string;
    media_filename: string | null;
    price: number;
    total_plays?: number;
}

export interface OrderDetail {
    id: number;
    order_number: string;
    status: string;
    amount_paid: number;
    items: OrderItem[];
}

export interface AnalyticsResponse {
    order: {
        id: number;
        order_number: string;
        status: string;
        amount_paid: number;
    };
    campaign: {
        title: string;
        date_range: string;
        start_date: string;
        end_date: string;
        duration_label: string;
    };
    summary: {
        total_spend: number;
        total_screens: number;
        total_media_play: number;
        active_days: number;
        active_hours: number;
        avg_daily_plays: number;
        avg_day_factor: number;
        avg_venue_factor: number;
    };
    delivery_model: any;
    daily_stats: any[];
    screen_breakdown: any[];
    hourly_breakdown: any[];
    reports: any[];
    generated_at: string;
}

export interface RelaunchRequest {
    order_ids: number[];
    start_date?: string;
}

export interface RelaunchResponse {
    message: string;
    created_count: number;
    updated_count: number;
    items: any[];
    cart: any;
}

interface OrdersApiResponse {
    success: boolean;
    data: {
        orders: OrderSummary[];
        pagination: PaginationMeta;
    };
}

interface OrderDetailApiResponse {
    success: boolean;
    data: {
        order: OrderDetail;
    };
}

// ─────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────

const ORDER_ROUTE = '/advertiser/orders';

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

const orderApi = {
    /**
     * Fetches a paginated list of advertiser orders.
     * Matches GET /advertiser/orders
     */
    getOrders: async (params?: {
        page?: number;
        per_page?: number;
        status?: OrderStatus;
    }): Promise<{ orders: OrderSummary[]; pagination: PaginationMeta }> => {
        const response = await apiClient.get<any>(ORDER_ROUTE, { params });

        // Debug: log the raw response so we can see what the server actually returns
        console.log('[orderService] raw response:', JSON.stringify(response.data, null, 2));

        // Defensive: handle multiple possible response shapes
        const rawData = response.data?.data ?? response.data;
        const rawOrders = rawData?.orders ?? [];
        const rawPagination = rawData?.pagination ?? {
            page: 1, per_page: 10, total: rawOrders.length,
            pages: 1, has_next: false, has_prev: false,
        };

        return {
            orders: rawOrders,
            pagination: rawPagination,
        };
    },

    /**
     * Fetches a single order with its items.
     * Matches GET /advertiser/orders/{order_id}
     */
    getOrderById: async (orderId: number | string): Promise<OrderDetail> => {
        const response = await apiClient.get<OrderDetailApiResponse>(`${ORDER_ROUTE}/${orderId}`);
        return response?.data?.data?.order;
    },

    /**
     * Fetches campaign analytics for a completed order.
     * Matches GET /advertiser/orders/{order_id}/analytics
     */
    getAnalytics: async (orderId: number | string, range: string = 'all', startDate?: string, endDate?: string): Promise<AnalyticsResponse> => {
        const params: any = { range };
        if (range === 'custom' && startDate && endDate) {
            params.start_date = startDate;
            params.end_date = endDate;
        }
        const response = await apiClient.get<{ success: boolean, data: { analytics: AnalyticsResponse } }>(`${ORDER_ROUTE}/${orderId}/analytics`, { params });
        return response?.data?.data?.analytics;
    },

    /**
     * Relaunches completed campaigns.
     * Matches POST /advertiser/orders/relaunch
     */
    relaunchOrders: async (data: RelaunchRequest): Promise<RelaunchResponse> => {
        const response = await apiClient.post<{ success: boolean, data: RelaunchResponse }>(`${ORDER_ROUTE}/relaunch`, data);
        return response?.data?.data;
    },
};

export default orderApi;

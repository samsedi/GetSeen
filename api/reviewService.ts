import apiClient from './client';
import { PaginationMeta } from './advertiserScreenService';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ReviewStatus = 'all' | 'pending' | 'approved' | 'rejected';

export interface AdvertiserData {
    id: number;
    name: string;
    business_name: string;
}

export interface Review {
    id: number;
    advertiser_id?: number;
    screen_id?: number;
    order_id?: number;
    rating: number;
    review_text?: string;
    status: ReviewStatus | string;
    screen?: any;
    order?: any;
    advertiser?: AdvertiserData;
}

// Responses
export interface ReviewsListResponse {
    reviews: Review[];
    pagination: PaginationMeta;
}

export interface OrderReviewStatusResponse {
    order: {
        id: number;
        order_number: string;
        status: string;
        status_display: string;
    };
    review: {
        can_review: boolean;
        has_review: boolean;
        reviews: Review[];
    };
}

export interface SubmitReviewResponse {
    message: string;
    review: {
        can_review: boolean;
        has_review: boolean;
        reviews: Review[];
    };
}

export interface ScreenReviewsResponse {
    screen: any;
    rating: {
        average: number;
        count: number;
    };
    reviews: Review[];
    pagination: PaginationMeta;
}

// ─────────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────────

/**
 * ADVERTISER: Get all reviews submitted by the advertiser
 */
const getAdvertiserReviews = async (params: { page?: number; per_page?: number; status?: ReviewStatus }): Promise<ReviewsListResponse> => {
    const response = await apiClient.get('/advertiser/reviews', { params });
    return response.data?.data;
};

/**
 * ADVERTISER: Check if a completed order can be reviewed
 */
const getOrderReviewStatus = async (orderId: number): Promise<OrderReviewStatusResponse> => {
    const response = await apiClient.get(`/advertiser/orders/${orderId}/review`);
    return response.data?.data;
};

/**
 * ADVERTISER: Submit or update a review for an order
 */
const submitOrderReview = async (orderId: number, data: { rating: number; review_text?: string }): Promise<SubmitReviewResponse> => {
    const response = await apiClient.post(`/advertiser/orders/${orderId}/review`, data);
    return response.data?.data;
};

/**
 * ADVERTISER / PUBLIC: Get approved reviews for a specific screen
 */
const getScreenReviews = async (screenId: number, params: { page?: number; per_page?: number } = {}): Promise<ScreenReviewsResponse> => {
    const response = await apiClient.get(`/advertiser/screens/${screenId}/reviews`, { params });
    return response.data?.data;
};

/**
 * SCREEN OWNER: Get reviews for their screens
 */
const getScreenOwnerReviews = async (params: { page?: number; per_page?: number; status?: ReviewStatus; rating?: string; search?: string }): Promise<ReviewsListResponse> => {
    const response = await apiClient.get('/screen-owner/reviews', { params });
    return response.data?.data;
};

export default {
    getAdvertiserReviews,
    getOrderReviewStatus,
    submitOrderReview,
    getScreenReviews,
    getScreenOwnerReviews,
};

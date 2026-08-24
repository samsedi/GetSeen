import apiClient from './client';

// ─────────────────────────────────────────────────────────────
// Types (mirroring backend DTOs)
// ─────────────────────────────────────────────────────────────

export interface CartItemResponse {
    id: string;
    screenId: string;
    screenName: string;
    screenCity: string;
    screenImageUrl: string | null;
    startDate: string;
    endDate: string;
    mediaUrl: string | null;
    mediaFilename: string | null;
    hasMedia: boolean;
    duration: string;
    durationMultiplier: number;
    totalPrice: number;
}

export interface CartResponse {
    id: string | null;
    accountId: string;
    items: CartItemResponse[];
    subtotal: number;
    totalAmount: number;
    itemCount: number;
}

export interface CouponData {
    code: string;
    discount_type: string;
    discount_value: number;
}

export interface CheckoutSummaryResponse {
    ready: boolean;
    blocking_errors: Array<{
        code: string;
        cart_item_id: number;
        screen_id: number;
        message: string;
    }>;
    checkout: {
        items: any[];
        item_count: number;
        currency_symbol: string;
        subtotal: number;
        discount: number;
        total: number;
        coupon: CouponData | null;
        coupon_error: string | null;
    };
}

export interface PaymentInitResponse {
    payment: {
        reference: string;
        amount: number;
        status: string;
    };
    paystack: {
        authorization_url: string;
        access_code: string;
        reference: string;
        public_key_required_on_mobile: boolean;
    };
}

export interface PreviousMediaResponse {
    filename: string;
    name: string;
    media_type: string;
    source: string;
    url: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers (private to this module)
// ─────────────────────────────────────────────────────────────

const ADVERTISER_CART_ROUTE = '/advertiser/cart';

const postMultipart = async (url: string, formData: FormData, onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<void> => {
    await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
};

// ─────────────────────────────────────────────────────────────
// Commands (return void, mutate server state)
// ─────────────────────────────────────────────────────────────

const addToCart = async (data: AddToCartRequest): Promise<void> => {
    await apiClient.post(ADVERTISER_CART_ROUTE, data);
};

const updateCartItem = async (itemId: string, data: UpdateCartItemRequest): Promise<void> => {
    await apiClient.patch(`${ADVERTISER_CART_ROUTE}/${itemId}`, data);
};

const removeFromCart = async (itemId: string): Promise<void> => {
    await apiClient.delete(`${ADVERTISER_CART_ROUTE}/${itemId}`);
};

const clearCart = async (): Promise<void> => {
    await apiClient.delete(ADVERTISER_CART_ROUTE);
};

const uploadCartItemMedia = async (itemId: string, mediaFile: { uri: string; name: string; type: string }, onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<void> => {
    const formData = new FormData();
    formData.append('media_type', mediaFile.type.startsWith('video') ? 'video' : 'image');
    formData.append('media', mediaFile as any);
    await postMultipart(`${ADVERTISER_CART_ROUTE}/${itemId}/media`, formData, onProgress, signal);
};

const attachExistingMedia = async (itemId: string, existingMediaFilename: string): Promise<void> => {
    const formData = new FormData();
    formData.append('media_type', 'image'); // Defaulting to image as per docs for attach
    formData.append('existing_media', existingMediaFilename);
    await postMultipart(`${ADVERTISER_CART_ROUTE}/${itemId}/media`, formData);
};

const validateCoupon = async (coupon: string): Promise<{ subtotal: number; discount: number; total: number; coupon: CouponData }> => {
    const response = await apiClient.post(`${ADVERTISER_CART_ROUTE}/validate-coupon`, { coupon });
    return response.data?.data;
};

const getCheckoutSummary = async (coupon?: string): Promise<CheckoutSummaryResponse> => {
    const url = coupon ? `${ADVERTISER_CART_ROUTE}/checkout-summary?coupon=${coupon}` : `${ADVERTISER_CART_ROUTE}/checkout-summary`;
    const response = await apiClient.get(url);
    return response.data?.data;
};

const initializePayment = async (coupon?: string, orderNote?: string): Promise<PaymentInitResponse> => {
    const payload: any = {};
    if (coupon) payload.coupon = coupon;
    if (orderNote) payload.order_note = orderNote;
    const response = await apiClient.post<{ data: PaymentInitResponse }>(`${ADVERTISER_CART_ROUTE}/checkout`, payload);
    return response.data?.data;
};

const verifyPayment = async (reference: string): Promise<any> => {
    const response = await apiClient.post(`/advertiser/payments/${reference}/verify`);
    return response.data;
};

// ─────────────────────────────────────────────────────────────
// Queries (return data, never mutate server state)
// ─────────────────────────────────────────────────────────────

const getCart = async (): Promise<CartResponse> => {
    const response = await apiClient.get<any>(ADVERTISER_CART_ROUTE);
    const cartData = response.data?.data?.cart;
    
    if (!cartData) {
        return { id: null, accountId: '', items: [], subtotal: 0, totalAmount: 0, itemCount: 0 };
    }

    const items: CartItemResponse[] = (cartData.items || []).map((item: any) => ({
        id: String(item.id),
        screenId: String(item.screen_id),
        screenName: item.screen_title || item.screen?.title || 'Unknown Screen',
        screenCity: '', // Not provided in this payload
        screenImageUrl: item.screen?.primary_image_url || null,
        startDate: item.start_date,
        endDate: item.end_date,
        mediaUrl: item.media_url || (item.media_filename && item.media_filename.startsWith('http') ? item.media_filename : 
            (item.media_filename ? `https://www.trygetseen.com/static/images/cart_items/${item.media_filename.replace(/^\/+/, '')}` : null)),
        mediaFilename: item.media_filename || null,
        hasMedia: item.has_media || false,
        duration: item.duration || 'weekly',
        durationMultiplier: item.duration_multiplier || 1,
        totalPrice: Number(item.price) || 0,
    }));

    return {
        id: null,
        accountId: '',
        items,
        subtotal: Number(cartData.subtotal) || 0,
        totalAmount: Number(cartData.subtotal) || 0,
        itemCount: Number(cartData.item_count) || items.length,
    };
};

const getPreviousMedia = async (page: number = 1, perPage: number = 10): Promise<{ media: PreviousMediaResponse[], pagination: any }> => {
    const response = await apiClient.get<any>(`/advertiser/media?page=${page}&per_page=${perPage}`);
    return {
        media: response.data?.data?.media || [],
        pagination: response.data?.data?.pagination || {},
    };
};

// ─────────────────────────────────────────────────────────────
// FormData Builders (helpers for constructing payloads)
// ─────────────────────────────────────────────────────────────

export interface AddToCartRequest {
    screen_id: number | string;
    duration: string;
    duration_multiplier: number;
    start_date: string;
    end_date: string;
}

export interface UpdateCartItemRequest {
    duration: string;
    duration_multiplier: number;
    start_date: string;
    end_date: string;
}

const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    uploadCartItemMedia,
    validateCoupon,
    getCheckoutSummary,
    initializePayment,
    verifyPayment,
    getPreviousMedia,
    attachExistingMedia,
};

export default cartService;

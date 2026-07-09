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
    totalPrice: number;
}

export interface CartResponse {
    id: string | null;
    accountId: string;
    items: CartItemResponse[];
    totalAmount: number;
}

// ─────────────────────────────────────────────────────────────
// Helpers (private to this module)
// ─────────────────────────────────────────────────────────────

const CART_ROUTE = '/cart';

const postMultipart = async (url: string, formData: FormData): Promise<void> => {
    await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ─────────────────────────────────────────────────────────────
// Commands (return void, mutate server state)
// ─────────────────────────────────────────────────────────────

const addToCart = async (formData: FormData): Promise<void> => {
    await postMultipart(`${CART_ROUTE}/items`, formData);
};

const removeFromCart = async (itemId: string): Promise<void> => {
    await apiClient.delete(`${CART_ROUTE}/items/${itemId}`);
};

const clearCart = async (): Promise<void> => {
    await apiClient.delete(CART_ROUTE);
};

const initializePayment = async (amount: number, email: string): Promise<{ reference: string }> => {
    const response = await apiClient.post<{ reference: string }>('/payments/initialize', { amount: amount.toString(), email });
    return response.data;
};

const verifyPayment = async (reference: string): Promise<void> => {
    await apiClient.post(`/payments/verify?reference=${reference}`);
};

// ─────────────────────────────────────────────────────────────
// Queries (return data, never mutate server state)
// ─────────────────────────────────────────────────────────────

const getCart = async (): Promise<CartResponse> => {
    const response = await apiClient.get<CartResponse>(CART_ROUTE);
    return response.data;
};

// ─────────────────────────────────────────────────────────────
// FormData Builders (helpers for constructing payloads)
// ─────────────────────────────────────────────────────────────

export interface AddToCartData {
    screenId: string;
    startDate: string; // 'yyyy-MM-dd'
    endDate: string;   // 'yyyy-MM-dd'
}

const buildAddToCartFormData = (data: AddToCartData, mediaFile?: { uri: string; name: string; type: string }): FormData => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (mediaFile) {
        formData.append('media', mediaFile as any);
    }
    return formData;
};

const cartService = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    initializePayment,
    verifyPayment,
    buildAddToCartFormData,
};

export default cartService;

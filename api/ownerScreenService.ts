import apiClient from './client';

export interface OwnerScreenPricing {
    currency_symbol: string;
    daily: number;
    weekly: number;
    monthly: number;
    base_daily: number;
    base_weekly: number;
    base_monthly: number;
}

export interface OwnerScreenCategory {
    id: number;
    name: string;
    description: string;
}

export interface OwnerScreenImage {
    filename: string;
    url: string;
}

export interface OwnerScreenResponse {
    id: number | string;
    title: string;
    description: string;
    address: string;
    state: string;
    country: string;
    status: string;
    review: string;
    auto_status: string;
    category_id: number | null;
    category: OwnerScreenCategory | null;
    venue_type: string;
    monthly_visitors: number;
    weekdays_hours: string;
    weekends_hours: string;
    age_range: string;
    dwell_time: string;
    target_audience: string;
    no_of_screens: number;
    dimensions: string;
    orientation: string;
    male_percentage: number;
    female_percentage: number;
    emails: string[];
    min_booking_days: number | null;
    price: number;
    price_per_week: number;
    price_per_month: number;
    daily_price: number;
    weekly_price: number;
    monthly_price: number;
    daily_markup_price: number;
    weekly_markup_price: number;
    monthly_markup_price: number;
    vendor_price: number;
    vendor_price_per_week: number;
    vendor_price_per_month: number;
    pricing: OwnerScreenPricing;
    images: OwnerScreenImage[];
    image_urls: string[];
    primary_image_url: string;
}

export interface ScreenOptionCategory {
    id: number;
    name: string;
    is_custom: boolean;
}

export interface ScreenOptionCountry {
    id: number;
    name: string;
    currency_symbol: string;
}

export interface ScreenOptionState {
    id: number;
    name: string;
    country_id: number;
}

export interface ScreenOptionsData {
    categories: ScreenOptionCategory[];
    countries: ScreenOptionCountry[];
    states: ScreenOptionState[];
}

export interface ScreenCloneData {
    title: string;
    description: string;
    category_id: number | null;
    custom_category_name: string | null;
    country_id: number;
    state_id: number;
    address: string;
    monthly_visitors: number;
    weekdays_hours: string;
    weekends_hours: string;
    age_range: string;
    dwell_time: string;
    target_audience: string;
    no_of_screens: number;
    dimensions: string;
    orientation: string;
    male_percentage: number;
    female_percentage: number;
    price: number;
    price_per_week: number;
    price_per_month: number;
    screen_email: string[];
}

export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface OwnerScreensListResponse {
    success: boolean;
    data: {
        screens: OwnerScreenResponse[];
        pagination: PaginationMeta;
    };
}

const OWNER_SCREEN_ROUTE = '/screen-owner/screens';

const withProgress = (onProgress?: (p: number) => void) => ({
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
        ? (progressEvent: { loaded: number; total?: number }) => {
              if (progressEvent.total) {
                  onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
              }
          }
        : undefined,
});

const ownerScreenApi = {
    getScreens: async (params?: { page?: number; per_page?: number; status?: string; review?: string }): Promise<OwnerScreensListResponse> => {
        const response = await apiClient.get<OwnerScreensListResponse>(OWNER_SCREEN_ROUTE, { params });
        return response.data;
    },
    getScreenById: async (id: string | number): Promise<{ success: boolean; data: { screen: OwnerScreenResponse } }> => {
        const response = await apiClient.get<{ success: boolean; data: { screen: OwnerScreenResponse } }>(`${OWNER_SCREEN_ROUTE}/${id}`);
        return response.data;
    },
    updateScreenStatus: async (id: string | number, status: 'online' | 'offline'): Promise<{ success: boolean; data: { message: string, screen: OwnerScreenResponse } }> => {
        const response = await apiClient.patch<{ success: boolean; data: { message: string, screen: OwnerScreenResponse } }>(`${OWNER_SCREEN_ROUTE}/${id}/status`, { status });
        return response.data;
    },

    getScreenOptions: async (countryId?: number): Promise<ScreenOptionsData> => {
        const response = await apiClient.get<{ success: boolean; data: ScreenOptionsData }>(
            '/screen-owner/screen-options',
            { params: countryId ? { country_id: countryId } : undefined }
        );
        return response.data.data;
    },

    createScreen: async (formData: FormData, onProgress?: (p: number) => void): Promise<OwnerScreenResponse> => {
        const response = await apiClient.post<{ success: boolean; data: { screen: OwnerScreenResponse } }>(
            OWNER_SCREEN_ROUTE,
            formData,
            withProgress(onProgress)
        );
        return response.data.data.screen;
    },

    updateScreen: async (id: string | number, formData: FormData, onProgress?: (p: number) => void): Promise<OwnerScreenResponse> => {
        const response = await apiClient.patch<{ success: boolean; data: { screen: OwnerScreenResponse } }>(
            `${OWNER_SCREEN_ROUTE}/${id}`,
            formData,
            withProgress(onProgress)
        );
        return response.data.data.screen;
    },

    deleteScreen: async (id: string | number): Promise<void> => {
        await apiClient.delete(`${OWNER_SCREEN_ROUTE}/${id}`);
    },

    uploadScreenImage: async (id: string | number, imageKey: string, fileUri: string, fileName: string, mimeType: string): Promise<{ filename: string; url: string }> => {
        const formData = new FormData();
        formData.append('file', { uri: fileUri, name: fileName, type: mimeType } as any);
        const response = await apiClient.post<{ success: boolean; data: { image: { filename: string; url: string } } }>(
            `${OWNER_SCREEN_ROUTE}/${id}/images/${imageKey}`,
            formData,
            withProgress()
        );
        return response.data.data.image;
    },

    deleteScreenImage: async (id: string | number, imageKey: string): Promise<void> => {
        await apiClient.delete(`${OWNER_SCREEN_ROUTE}/${id}/images/${imageKey}`);
    },

    getCloneData: async (id: string | number): Promise<ScreenCloneData> => {
        const response = await apiClient.get<{ success: boolean; data: { clone: ScreenCloneData } }>(`${OWNER_SCREEN_ROUTE}/${id}/clone-data`);
        return response.data.data.clone;
    },
};

export default ownerScreenApi;

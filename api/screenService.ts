import apiClient from './client';

export interface ScreenResponseDto {
    id: string;
    name: string;
    venueType: string;
    description: string;
    screenEmails: string[];
    country: string;
    state: string;
    city: string;
    address: string;
    resolution: string;
    orientation: string;
    screenCount: number;
    priceDaily: number;
    priceWeekly: number;
    priceMonthly: number;
    weekdaysHours: string;
    weekendsHours: string;
    dailyTraffic: number;
    targetAudience: string;
    ageRange: string;
    dwellTime: string;
    malePercentage: string;
    femalePercentage: string;
    verificationStatus: string;
    mediaUrls: string[];
    active: boolean;
}

export interface ScreenDraftResponseDto {
    id: string;
    name?: string;
    venueType?: string;
    description?: string;
    screenEmails?: string[];
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    resolution?: string;
    orientation?: string;
    screenCount?: number;
    priceDaily?: number;
    priceWeekly?: number;
    priceMonthly?: number;
    weekdaysHours?: string;
    weekendsHours?: string;
    dailyTraffic?: number;
    targetAudience?: string;
    ageRange?: string;
    dwellTime?: string;
    malePercentage?: string;
    femalePercentage?: string;
    mediaUrls?: string[];
    createdAt: string;
    updatedAt: string;
}

const SCREEN_ROUTE = "/screens";

const screenApi = {
    createScreen: async (formData: FormData): Promise<ScreenResponseDto> => {
        const response = await apiClient.post<ScreenResponseDto>(SCREEN_ROUTE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getMyScreens: async (): Promise<ScreenResponseDto[]> => {
        const response = await apiClient.get<ScreenResponseDto[]>(`${SCREEN_ROUTE}/my`);
        return response.data;
    },

    getAllScreens: async (): Promise<ScreenResponseDto[]> => {
        const response = await apiClient.get<ScreenResponseDto[]>(SCREEN_ROUTE);
        return response.data;
    },

    getScreenById: async (id: string): Promise<ScreenResponseDto> => {
        const response = await apiClient.get<ScreenResponseDto>(`${SCREEN_ROUTE}/${id}`);
        return response.data;
    },

    updateScreen: async (id: string, formData: FormData): Promise<ScreenResponseDto> => {
        const response = await apiClient.put<ScreenResponseDto>(`${SCREEN_ROUTE}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteScreen: async (id: string): Promise<void> => {
        await apiClient.delete(`${SCREEN_ROUTE}/${id}`);
    },

    toggleVisibility: async (id: string): Promise<ScreenResponseDto> => {
        const response = await apiClient.patch<ScreenResponseDto>(`${SCREEN_ROUTE}/${id}/toggle`);
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // DRAFT ENDPOINTS
    // ─────────────────────────────────────────────────────────────

    createDraft: async (formData: FormData): Promise<ScreenDraftResponseDto> => {
        const response = await apiClient.post<ScreenDraftResponseDto>('/screens/drafts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getMyDrafts: async (): Promise<ScreenDraftResponseDto[]> => {
        const response = await apiClient.get('/screens/drafts');
        return response.data;
    },

    getDraftById: async (id: string): Promise<ScreenDraftResponseDto> => {
        const response = await apiClient.get(`/screens/drafts/${id}`);
        return response.data;
    },

    updateDraft: async (id: string, formData: FormData): Promise<ScreenDraftResponseDto> => {
        const response = await apiClient.put<ScreenDraftResponseDto>(`/screens/drafts/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteDraft: async (id: string): Promise<void> => {
        await apiClient.delete(`/screens/drafts/${id}`);
    },

    publishDraft: async (id: string): Promise<ScreenResponseDto> => {
        const response = await apiClient.post(`/screens/drafts/${id}/publish`);
        return response.data;
    }
};

export default screenApi;
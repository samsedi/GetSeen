import apiClient from './client'; // Ensure this points to your exact axios client file path
import * as SecureStore from 'expo-secure-store';

export interface ScreenResponseDto {
    id: string;
    name: string;
    venueType: string;
    description: string;
    screenEmails: string[];
    // --- Location Details ---
    country: string;
    state: string;
    city: string;
    address: string;
    // --- Media Specifications & Hardware Setup ---
    resolution: string;
    orientation: string;
    screenCount: number;
    // --- Pricing Structures ---
    priceDaily: number;
    priceWeekly: number;
    priceMonthly: number;
    // --- Operating Hours ---
    weekdaysHours: string;
    weekendsHours: string;
    // --- Demographics / Traffic Insights ---
    dailyTraffic: number;
    targetAudience: string;
    ageRange: string;
    dwellTime: string;
    malePercentage: string;
    femalePercentage: string;
    // --- Status & Meta ---
    verificationStatus: string;
    mediaUrls: string[];
    active: boolean;
}

export interface ScreenDraftResponseDto {
    id: string;

    // Basic Info
    name?: string;
    venueType?: string;
    description?: string;
    screenEmails?: string[];

    // Location Details
    country?: string;
    state?: string;
    city?: string;
    address?: string;

    // Media Specifications & Hardware Setup
    resolution?: string;
    orientation?: string;
    screenCount?: number;

    // Pricing Structures
    priceDaily?: number;
    priceWeekly?: number;
    priceMonthly?: number;

    // Operating Hours
    weekdaysHours?: string;
    weekendsHours?: string;

    // Demographics / Traffic Insights
    dailyTraffic?: number;
    targetAudience?: string;
    ageRange?: string;
    dwellTime?: string;
    malePercentage?: string;
    femalePercentage?: string;

    // Media & Timestamps
    mediaUrls?: string[];
    createdAt: string;
    updatedAt: string;
}

const SCREEN_ROUTE = "/screens";

// Helper to pull the exact base URL you set in your apiClient file dynamically
const getBaseUrl = () => apiClient.defaults.baseURL || 'http://10.199.113.155:8080/api/v1';

const screenApi = {
    // 1. CREATE (POST /api/v1/screens) - Uses Fetch to bypass Axios boundary bugs
    createScreen: async (formData: FormData): Promise<ScreenResponseDto> => {
        const token = await SecureStore.getItemAsync('userToken');

        const response = await fetch(`${getBaseUrl()}${SCREEN_ROUTE}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("🚨 RAW BACKEND REJECTION:", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.debug_cause || errorJson.message || 'Failed to submit screen.');
            } catch (e) {
                throw new Error(`Server rejected the upload (Status: ${response.status}). Check your Expo terminal for details.`);
            }
        }
        return await response.json();
    },

    // 2. LIST OWNED (GET /api/v1/screens/my)
    getMyScreens: async (): Promise<ScreenResponseDto[]> => {
        const response = await apiClient.get<ScreenResponseDto[]>(`${SCREEN_ROUTE}/my`);
        return response.data;
    },

    // 3. VIEW SINGLE (GET /api/v1/screens/{id})
    getScreenById: async (id: string): Promise<ScreenResponseDto> => {
        const response = await apiClient.get<ScreenResponseDto>(`${SCREEN_ROUTE}/${id}`);
        return response.data;
    },

    // 4. UPDATE (PUT /api/v1/screens/{id}) - Uses Fetch to bypass Axios boundary bugs
    updateScreen: async (id: string, formData: FormData): Promise<ScreenResponseDto> => {
        const token = await SecureStore.getItemAsync('userToken');

        const response = await fetch(`${getBaseUrl()}${SCREEN_ROUTE}/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("🚨 RAW BACKEND REJECTION:", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.debug_cause || errorJson.message || 'Failed to update screen.');
            } catch (e) {
                throw new Error(`Server rejected the update (Status: ${response.status}). Check your Expo terminal for details.`);
            }
        }
        return await response.json();
    },

    // 5. DELETE (DELETE /api/v1/screens/{id})
    deleteScreen: async (id: string): Promise<void> => {
        await apiClient.delete(`${SCREEN_ROUTE}/${id}`);
    },

    // 6. TOGGLE VISIBILITY (PATCH /api/v1/screens/{id}/toggle)
    toggleVisibility: async (id: string): Promise<ScreenResponseDto> => {
        const response = await apiClient.patch<ScreenResponseDto>(`${SCREEN_ROUTE}/${id}/toggle`);
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // DRAFT ENDPOINTS
    // ─────────────────────────────────────────────────────────────

    // ✨ UPDATED: Uses fetch to safely send FormData
    createDraft: async (formData: FormData): Promise<ScreenDraftResponseDto> => {
        const token = await SecureStore.getItemAsync('userToken');

        const response = await fetch(`${getBaseUrl()}/screens/drafts`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || errorJson.message || 'Failed to save draft.');
            } catch (e: any) {
                if (e.message && e.message !== 'Failed to save draft.' && !e.message.includes('Unexpected token')) {
                    throw e; // rethrow the parsed error
                }
                throw new Error(`Failed to save draft. Server returned ${response.status}`);
            }
        }
        return await response.json();
    },

    getMyDrafts: async (): Promise<ScreenDraftResponseDto[]> => {
        const response = await apiClient.get('/screens/drafts');
        return response.data;
    },

    getDraftById: async (id: string): Promise<ScreenDraftResponseDto> => {
        const response = await apiClient.get(`/screens/drafts/${id}`);
        return response.data;
    },

    // ✨ UPDATED: Uses fetch to safely send FormData
    updateDraft: async (id: string, formData: FormData): Promise<ScreenDraftResponseDto> => {
        const token = await SecureStore.getItemAsync('userToken');

        const response = await fetch(`${getBaseUrl()}/screens/drafts/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || errorJson.message || 'Failed to update draft.');
            } catch (e: any) {
                if (e.message && e.message !== 'Failed to update draft.' && !e.message.includes('Unexpected token')) {
                    throw e; // rethrow the parsed error
                }
                throw new Error(`Failed to update draft. Server returned ${response.status}`);
            }
        }
        return await response.json();
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
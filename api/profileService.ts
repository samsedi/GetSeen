import { clearCache, getCached } from './cacheService';
import apiClient from './client';

export interface ProfileData {
    id: number;
    email: string;
    phone: string;
    role: string;

    // Advertiser / General
    name?: string;
    first_name?: string;
    last_name?: string;
    country_id?: number;
    business_name?: string;
    business_reg_no?: string;
    industry?: string;
    fb_url?: string | null;
    ig_url?: string | null;
    tiktok_url?: string | null;

    // Screen Owner Specific
    company_name?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    onboarding_tutorial_completed?: boolean;
    onboarding_session_booked?: boolean;
    avatarUrl?: string; // keeping camelCase for app-specific usage if not from API
}

export interface UpdateProfileRequest {
    // Advertiser
    first_name?: string;
    last_name?: string;
    phone?: string;
    country_id?: number;
    business_name?: string;
    business_reg_no?: string;
    industry?: string;

    // Screen Owner
    company_name?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;

    // Social
    fb_url?: string;
    ig_url?: string;
    tiktok_url?: string;
}

export const fetchProfile = async (role: string): Promise<ProfileData> => {
    return getCached(`profile_${role}`, async () => {
        // According to Phase 2, GET /profile doesn't require the role query param, but keeping cache keys separate
        const response = await apiClient.get('/profile');
        // Assuming success format: { success: true, data: { user: {...} } }
        return response?.data?.data?.user;
    });
};

export const updateProfile = async (role: string, data: UpdateProfileRequest): Promise<ProfileData> => {
    // Phase 2 calls for PATCH /profile
    const response = await apiClient.patch('/profile', data);
    clearCache(`profile_${role}`);
    return response?.data?.data?.user || response.data;
};

export const uploadAvatar = async (
    role: string, 
    imageUri: string,
    onProgress?: (progress: number) => void
): Promise<ProfileData> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    
    // Infer the type of the image
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
    } as any);

    const response = await apiClient.post(`/profile/avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
    
    clearCache(`profile_${role}`);
    return response?.data?.data?.user || response.data;
};


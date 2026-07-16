import apiClient from './client';
import { getCached, clearCache } from './cacheService';

export interface ProfileData {
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phoneNumber?: string;
    country?: string;
    city?: string;
    taxId?: string;
    category?: string;
    avatarUrl?: string;
    bankDetails?: string;
    businessRegNo?: string;
    industry?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phoneNumber?: string;
    country?: string;
    city?: string;
    taxId?: string;
    category?: string;
    bankDetails?: string;
    businessRegNo?: string;
    industry?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
}

export const fetchProfile = async (role: string): Promise<ProfileData> => {
    return getCached(`profile_${role}`, async () => {
        const response = await apiClient.get(`/profile?role=${role}`);
        return response.data;
    });
};

export const updateProfile = async (role: string, data: UpdateProfileRequest): Promise<ProfileData> => {
    const response = await apiClient.put(`/profile?role=${role}`, data);
    clearCache(`profile_${role}`);
    return response.data;
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

    const response = await apiClient.post(`/profile/avatar?role=${role}`, formData, {
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
    return response.data;
};

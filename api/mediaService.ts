import apiClient from './client';

export interface MediaItemResponse {
    filename: string;
    name: string;
    media_type: 'image' | 'video' | string;
    source: 'uploaded' | 'order' | string;
    url: string;
}

export interface MediaResponseData {
    media: MediaItemResponse[];
    pagination: {
        page?: number;
        per_page?: number;
        total?: number;
        pages?: number;
        has_next?: boolean;
        has_prev?: boolean;
    };
}

export interface MediaApiResponse {
    success: boolean;
    data: MediaResponseData;
}

const getAdvertiserMedia = async (page = 1, per_page = 20): Promise<MediaResponseData> => {
    const response = await apiClient.get<MediaApiResponse>(`/advertiser/media?page=${page}&per_page=${per_page}`);
    return response?.data?.data;
};

const deleteAdvertiserMedia = async (filename: string, mediaType: string): Promise<{ success: boolean; message?: string }> => {
    // The endpoint expects DELETE /advertiser/media/{filename}?media_type={mediaType}
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/advertiser/media/${filename}?media_type=${mediaType}`);
    return response.data;
};

const mediaService = {
    getAdvertiserMedia,
    deleteAdvertiserMedia,
};

export default mediaService;

import apiClient from './client';

export interface OnboardingTutorialVideo {
    position: number;
    title: string;
    embed_url: string;
}

export interface TutorialListItem {
    id: number;
    title: string;
    description: string;
    youtube_url: string;
    youtube_video_id: string;
    thumbnail_url: string;
    embed_url: string;
    is_pinned: boolean;
    pin_order: number;
    audience_type?: string;
    audience_label?: string;
    status?: string;
    status_label?: string;
    created_at?: string;
}

export interface TutorialsPagination {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface TutorialsData {
    onboarding_tutorials: OnboardingTutorialVideo[];
    tutorials: TutorialListItem[];
    pagination: TutorialsPagination;
}

export interface TutorialsResponse {
    success: boolean;
    data: TutorialsData;
}

const ownerTutorialApi = {
    fetchTutorials: async (params?: { page?: number; per_page?: number; search?: string }): Promise<TutorialsData> => {
        const response = await apiClient.get<TutorialsResponse>('/screen-owner/tutorials', { params });
        return response?.data?.data;
    },
};

export default ownerTutorialApi;

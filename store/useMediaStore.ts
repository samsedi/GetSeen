import { create } from 'zustand';
import mediaService, { MediaItemResponse } from '@/api/mediaService';

interface MediaState {
    mediaList: MediaItemResponse[];
    isLoading: boolean;
    isFetchingMore: boolean;
    hasFetched: boolean;
    page: number;
    hasMore: boolean;
    fetchMedia: (reset?: boolean) => Promise<void>;
    deleteMedia: (filename: string, mediaType: string) => Promise<void>;
}

export const useMediaStore = create<MediaState>((set, get) => ({
    mediaList: [],
    isLoading: false,
    isFetchingMore: false,
    hasFetched: false,
    page: 1,
    hasMore: true,

    fetchMedia: async (reset = false) => {
        const { isLoading, isFetchingMore, hasMore, page, mediaList } = get();

        if (isLoading || isFetchingMore) return;

        const targetPage = reset ? 1 : page;

        if (reset) {
            set({ isLoading: true });
        } else {
            set({ isFetchingMore: true });
        }

        try {
            const data = await mediaService.getAdvertiserMedia(targetPage, 20);
            
            set({
                mediaList: reset ? data.media : [...mediaList, ...data.media],
                page: targetPage + 1,
                hasMore: data.pagination.has_next !== undefined 
                    ? data.pagination.has_next 
                    : (data.pagination.page || targetPage) < (data.pagination.pages || 1),
                hasFetched: true,
            });
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            set({ isLoading: false, isFetchingMore: false });
        }
    },

    deleteMedia: async (filename: string, mediaType: string) => {
        try {
            await mediaService.deleteAdvertiserMedia(filename, mediaType);
            
            // Remove the item from the local state
            const currentList = get().mediaList;
            set({ mediaList: currentList.filter(item => item.filename !== filename) });
        } catch (error: any) {
            // Rethrow so the UI can catch it and display an alert
            throw error;
        }
    }
}));

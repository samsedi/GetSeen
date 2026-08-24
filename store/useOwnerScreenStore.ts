import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import ownerScreenApi, { OwnerScreenResponse, PaginationMeta } from '@/api/ownerScreenService';

interface OwnerScreenState {
    screens: OwnerScreenResponse[];
    pagination: PaginationMeta | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    lastFetchedAt: number | null;
    
    fetchScreens: (params?: { page?: number; per_page?: number; status?: string; review?: string; forceRefresh?: boolean }) => Promise<void>;
    refreshScreens: () => Promise<void>;
    updateScreenInStore: (id: string | number, newStatus: string) => void;
}

// Cache is considered stale after 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

export const useOwnerScreenStore = create<OwnerScreenState>()(
    persist(
        (set, get) => ({
            screens: [],
            pagination: null,
            loading: false,
            refreshing: false,
            error: null,
            lastFetchedAt: null,
            
            fetchScreens: async (params = {}) => {
                const { page = 1, per_page = 10, status, review, forceRefresh = false } = params;
                const { screens, lastFetchedAt } = get();

                // Simple cache logic (only valid for page 1 without filters)
                if (
                    !forceRefresh &&
                    page === 1 &&
                    !status &&
                    !review &&
                    screens.length > 0 &&
                    lastFetchedAt &&
                    Date.now() - lastFetchedAt < CACHE_TTL_MS
                ) {
                    return; // Use cached data
                }

                set({ loading: true, error: null });
                try {
                    const response = await ownerScreenApi.getScreens({ page, per_page, status, review });
                    if (response.success && response.data) {
                        set({
                            screens: response.data.screens || [],
                            pagination: response.data.pagination || null,
                            lastFetchedAt: page === 1 ? Date.now() : lastFetchedAt,
                            loading: false,
                        });
                    } else {
                        set({ error: 'Failed to fetch owner screens.', loading: false });
                    }
                } catch (error: any) {
                    console.error('Error fetching owner screens:', error);
                    set({ error: error.message || 'An error occurred', loading: false });
                }
            },

            refreshScreens: async () => {
                set({ refreshing: true, error: null });
                try {
                    const response = await ownerScreenApi.getScreens({ page: 1, per_page: 10 });
                    if (response.success && response.data) {
                        set({
                            screens: response.data.screens || [],
                            pagination: response.data.pagination || null,
                            lastFetchedAt: Date.now(),
                            refreshing: false,
                        });
                    } else {
                        set({ error: 'Failed to refresh owner screens.', refreshing: false });
                    }
                } catch (error: any) {
                    console.error('Error refreshing owner screens:', error);
                    set({ error: error.message || 'An error occurred', refreshing: false });
                }
            },

            updateScreenInStore: (id, newStatus) => {
                set((state) => ({
                    screens: state.screens.map((screen) => 
                        screen.id.toString() === id.toString() ? { ...screen, status: newStatus } : screen
                    )
                }));
            },
        }),
        {
            name: 'owner-screen-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
        }
    )
);

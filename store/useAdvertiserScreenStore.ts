import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import advertiserScreenApi, { PaginationMeta } from '@/api/advertiserScreenService';
import { ScreenResponseDto } from '@/api/screenService';


interface AdvertiserScreenState {
    screens: ScreenResponseDto[];
    pagination: PaginationMeta | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    isFetching: boolean; // True for the whole lifetime of any in-flight fetch (background sync, loadMore, etc.)
    searchQuery: string;
    selectedVenue: string;
    lastFetchedAt: number | null; // Timestamp to detect stale cache
    
    // View Details specific state
    activeScreen: ScreenResponseDto | null;
    isFetchingScreen: boolean;
    screenError: string | null;

    setSearchQuery: (query: string) => void;
    setSelectedVenue: (venue: string) => void;
    fetchScreens: (params?: { page?: number; per_page?: number; search?: string; backgroundSync?: boolean; forceRefresh?: boolean }) => Promise<void>;
    loadMoreScreens: () => Promise<void>;
    loadLessScreens: () => void;
    refreshScreens: () => Promise<void>;
    
    // View Details specific actions
    fetchScreenById: (id: string) => Promise<void>;
    clearActiveScreen: () => void;
}

// Cache is considered stale after 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

export const useAdvertiserScreenStore = create<AdvertiserScreenState>()(
    persist(
        (set, get) => ({
            screens: [],
            pagination: null,
            loading: false,
            refreshing: false,
            error: null,
            isFetching: false,
            searchQuery: '',
            selectedVenue: 'For You',
            lastFetchedAt: null,
            
            activeScreen: null,
            isFetchingScreen: false,
            screenError: null,

            setSearchQuery: (query: string) => set({ searchQuery: query }),
            setSelectedVenue: (venue: string) => set({ selectedVenue: venue }),

            fetchScreens: async (params = {}) => {
                const { search, page = 1, per_page = 10, backgroundSync = false, forceRefresh = false } = params;
                
                const { screens, lastFetchedAt } = get();
                const now = Date.now();
                const cacheIsValid = lastFetchedAt && (now - lastFetchedAt) < CACHE_TTL_MS;

                // Skip cache if the user manually triggered a refresh (forceRefresh).
                // Otherwise: if cache is valid on initial load, serve the cache instantly
                // and silently sync in the background.
                if (!forceRefresh && page === 1 && screens.length > 0 && cacheIsValid && !backgroundSync) {
                    // Trigger a silent background sync without showing a spinner
                    get().fetchScreens({ search, page, per_page, backgroundSync: true });
                    return; // Return immediately — the UI renders from the cache
                }

                // Prevent overlapping requests (e.g. a background sync and a fast loadMore
                // firing together, or double-tapping loadMore) from racing and clobbering
                // each other's results — whichever resolved last used to always win.
                if (get().isFetching) return;

                // Only show the loading spinner if we have NO cached data to show
                if (!backgroundSync) {
                    set({ loading: screens.length === 0, error: null });
                }
                set({ isFetching: true });

                try {
                    const response = await advertiserScreenApi.getScreens({
                        page,
                        per_page,
                        search: search !== undefined ? search : get().searchQuery,
                    });

                    set({
                        screens: page === 1 ? response.screens : [...get().screens, ...response.screens],
                        pagination: response.pagination,
                        lastFetchedAt: Date.now(), // Update cache timestamp
                    });
                } catch (error: any) {
                    // On background sync failure, silently fail — the cache data stays visible
                    if (!backgroundSync) {
                        set({ error: error.message || 'Failed to fetch screens' });
                    }
                    console.error("Failed to load advertiser screens:", error);
                } finally {
                    if (!backgroundSync) {
                        set({ loading: false });
                    }
                    set({ isFetching: false });
                }
            },

            loadMoreScreens: async () => {
                const { pagination, loading, isFetching, searchQuery } = get();
                if (loading || isFetching || !pagination || !pagination.has_next) return;

                await get().fetchScreens({
                    page: pagination.page + 1,
                    per_page: pagination.per_page,
                    search: searchQuery
                });
            },

            loadLessScreens: () => {
                const { pagination, screens } = get();
                if (!pagination || pagination.page <= 1) return;

                const previousItemCount = (pagination.page - 1) * pagination.per_page;
                
                const newPage = pagination.page - 1;
                set({
                    screens: screens.slice(0, previousItemCount),
                    pagination: {
                        ...pagination,
                        page: newPage,
                        // Derive from total pages instead of hardcoding — stays correct even
                        // if `pages` changes between fetches (e.g. items added/removed server-side).
                        has_next: newPage < pagination.pages,
                    }
                });
            },

            refreshScreens: async () => {
                set({ refreshing: true });
                const { searchQuery, pagination } = get();
                
                try {
                    // forceRefresh: true guarantees we skip the cache and hit the backend,
                    // regardless of how recently the cache was populated.
                    await get().fetchScreens({
                        page: 1,
                        per_page: pagination?.per_page || 100,
                        search: searchQuery,
                        forceRefresh: true,
                    });
                } finally {
                    set({ refreshing: false });
                }
            },
            
            fetchScreenById: async (id: string) => {
                set({ isFetchingScreen: true, screenError: null });
                try {
                    const screen = await advertiserScreenApi.getScreenById(id);
                    set({ activeScreen: screen });
                } catch (error: any) {
                    console.error('Failed to load screen:', error);
                    set({ screenError: 'Failed to load screen details. Please try again.', activeScreen: null });
                } finally {
                    set({ isFetchingScreen: false });
                }
            },
            
            clearActiveScreen: () => set({ activeScreen: null, screenError: null })
        }),
        {
            name: 'advertiser-screens-cache', // The key used in AsyncStorage
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
            // Only persist the actual screen data and metadata — NOT loading/UI states
            partialize: (state) => ({
                screens: state.screens,
                pagination: state.pagination,
                lastFetchedAt: state.lastFetchedAt,
            }),
        }
    )
);

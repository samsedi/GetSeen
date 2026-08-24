import { PaginationMeta } from '@/api/advertiserScreenService';
import reviewApi, { Review, ReviewStatus } from '@/api/reviewService';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';

interface ReviewState {
    advertiserReviews: Review[];
    advertiserPagination: PaginationMeta | null;
    ownerReviews: Review[];
    ownerPagination: PaginationMeta | null;

    loading: boolean;
    refreshing: boolean;
    error: string | null;

    selectedAdvertiserStatus: ReviewStatus;
    selectedOwnerStatus: ReviewStatus;

    // Review Prompt State
    lastReviewPromptAt: number | null;
    dismissedReviewOrderIds: string[];
    setLastReviewPromptAt: (time: number) => void;
    dismissReviewOrder: (orderId: string) => void;

    // Actions
    setSelectedAdvertiserStatus: (status: ReviewStatus) => void;
    setSelectedOwnerStatus: (status: ReviewStatus) => void;

    fetchAdvertiserReviews: (params?: {
        page?: number;
        per_page?: number;
        status?: ReviewStatus;
        forceRefresh?: boolean;
    }) => Promise<void>;
    loadMoreAdvertiserReviews: () => Promise<void>;
    refreshAdvertiserReviews: () => Promise<void>;

    fetchOwnerReviews: (params?: {
        page?: number;
        per_page?: number;
        status?: ReviewStatus;
        forceRefresh?: boolean;
    }) => Promise<void>;
    loadMoreOwnerReviews: () => Promise<void>;
    refreshOwnerReviews: () => Promise<void>;
}

export const useReviewStore = create<ReviewState>()(
    persist(
        (set, get) => ({
            advertiserReviews: [],
            advertiserPagination: null,
            ownerReviews: [],
            ownerPagination: null,

            loading: false,
            refreshing: false,
            error: null,

            selectedAdvertiserStatus: 'all',
            selectedOwnerStatus: 'all',

            lastReviewPromptAt: null,
            dismissedReviewOrderIds: [],
            setLastReviewPromptAt: (time) => set({ lastReviewPromptAt: time }),
            dismissReviewOrder: (orderId) => set((state) => ({
                dismissedReviewOrderIds: [...state.dismissedReviewOrderIds, orderId]
            })),

            setSelectedAdvertiserStatus: (status) => set({ selectedAdvertiserStatus: status }),
            setSelectedOwnerStatus: (status) => set({ selectedOwnerStatus: status }),

            fetchAdvertiserReviews: async (params = {}) => {
                const {
                    page = 1,
                    per_page = 10,
                    status = get().selectedAdvertiserStatus,
                    forceRefresh = false
                } = params;

                // Simple cache logic (if we have data and we're not explicitly refreshing, just use what we have on page 1)
                if (page === 1 && !forceRefresh && get().advertiserReviews.length > 0 && status === get().selectedAdvertiserStatus) {
                    return;
                }

                set({ loading: page === 1, error: null });

                try {
                    const data = await reviewApi.getAdvertiserReviews({ page, per_page, status });
                    set((state) => ({
                        advertiserReviews: page === 1 ? data.reviews : [...state.advertiserReviews, ...data.reviews],
                        advertiserPagination: data.pagination,
                        loading: false
                    }));
                } catch (error: any) {
                    set({ error: error.message || 'Failed to fetch reviews', loading: false });
                }
            },

            loadMoreAdvertiserReviews: async () => {
                const { advertiserPagination, loading } = get();
                if (loading || !advertiserPagination || !advertiserPagination.has_next) return;
                await get().fetchAdvertiserReviews({ page: advertiserPagination.page + 1, forceRefresh: true });
            },

            refreshAdvertiserReviews: async () => {
                set({ refreshing: true });
                await get().fetchAdvertiserReviews({ page: 1, forceRefresh: true });
                set({ refreshing: false });
            },

            fetchOwnerReviews: async (params = {}) => {
                const {
                    page = 1,
                    per_page = 10,
                    status = get().selectedOwnerStatus,
                    forceRefresh = false
                } = params;

                if (page === 1 && !forceRefresh && get().ownerReviews.length > 0 && status === get().selectedOwnerStatus) {
                    return;
                }

                set({ loading: page === 1, error: null });

                try {
                    const data = await reviewApi.getScreenOwnerReviews({ page, per_page, status });
                    set((state) => ({
                        ownerReviews: page === 1 ? data.reviews : [...state.ownerReviews, ...data.reviews],
                        ownerPagination: data.pagination,
                        loading: false
                    }));
                } catch (error: any) {
                    set({ error: error.message || 'Failed to fetch owner reviews', loading: false });
                }
            },

            loadMoreOwnerReviews: async () => {
                const { ownerPagination, loading } = get();
                if (loading || !ownerPagination || !ownerPagination.has_next) return;
                await get().fetchOwnerReviews({ page: ownerPagination.page + 1, forceRefresh: true });
            },

            refreshOwnerReviews: async () => {
                set({ refreshing: true });
                await get().fetchOwnerReviews({ page: 1, forceRefresh: true });
                set({ refreshing: false });
            }
        }),
        {
            name: 'getseen-review-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
            partialize: (state) => ({
                advertiserReviews: state.advertiserReviews,
                advertiserPagination: state.advertiserPagination,
                ownerReviews: state.ownerReviews,
                ownerPagination: state.ownerPagination,
                lastReviewPromptAt: state.lastReviewPromptAt,
                dismissedReviewOrderIds: state.dismissedReviewOrderIds,
            }),
        }
    )
);

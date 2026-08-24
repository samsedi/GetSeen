import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import orderApi, { OrderSummary, OrderDetail, OrderStatus } from '@/api/orderService';
import { PaginationMeta } from '@/api/advertiserScreenService';

interface OrderState {
    orders: OrderSummary[];
    pagination: PaginationMeta | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    isFetching: boolean; // True for the whole lifetime of any in-flight fetch (background sync, loadMore, etc.)
    selectedStatus: OrderStatus;
    lastFetchedAt: number | null;

    // Detail-specific state
    activeOrder: OrderDetail | null;
    isFetchingOrder: boolean;
    orderError: string | null;
    enrichedOrders: Record<number, OrderDetail>; // Cache for order details so we can get screen titles

    // Actions
    setSelectedStatus: (status: OrderStatus) => void;
    fetchOrders: (params?: {
        page?: number;
        per_page?: number;
        status?: OrderStatus;
        backgroundSync?: boolean;
        forceRefresh?: boolean;
    }) => Promise<void>;
    loadMoreOrders: () => Promise<void>;
    refreshOrders: () => Promise<void>;
    fetchOrderById: (id: number | string) => Promise<void>;
    clearActiveOrder: () => void;
    relaunchOrder: (orderId: number) => Promise<{ success: boolean; error?: string }>;
}

// Cache is considered stale after 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            pagination: null,
            loading: false,
            refreshing: false,
            error: null,
            isFetching: false,
            selectedStatus: 'all',
            lastFetchedAt: null,

            activeOrder: null,
            isFetchingOrder: false,
            orderError: null,
            enrichedOrders: {},

            setSelectedStatus: (status: OrderStatus) => set({ selectedStatus: status }),

            fetchOrders: async (params = {}) => {
                const {
                    page = 1,
                    per_page = 10,
                    status,
                    backgroundSync = false,
                    forceRefresh = false,
                } = params;

                const { orders, lastFetchedAt, selectedStatus } = get();
                const now = Date.now();
                const cacheIsValid = lastFetchedAt && (now - lastFetchedAt) < CACHE_TTL_MS;

                // Serve from cache on initial load, then silently sync in the background
                if (!forceRefresh && page === 1 && orders.length > 0 && cacheIsValid && !backgroundSync) {
                    get().fetchOrders({ page, per_page, status, backgroundSync: true });
                    return;
                }

                // Prevent overlapping requests (e.g. a background sync and a fast loadMore
                // firing together, or double-tapping loadMore) from racing and clobbering
                // each other's results — whichever resolved last used to always win.
                if (get().isFetching) return;

                // Only show spinner if we have NO cached data to show
                if (!backgroundSync) {
                    set({ loading: orders.length === 0, error: null });
                }
                set({ isFetching: true });

                try {
                    const response = await orderApi.getOrders({
                        page,
                        per_page,
                        status: status ?? selectedStatus,
                    });

                    console.log('[useOrderStore] fetched orders count:', response.orders.length);

                    set({
                        orders: page === 1
                            ? response.orders
                            : [...get().orders, ...response.orders],
                        pagination: response.pagination,
                        lastFetchedAt: Date.now(),
                    });

                    // Background Enrichment: Fetch details for any orders we haven't enriched yet
                    // so we can display the screen title on the list card.
                    const { enrichedOrders } = get();
                    const missingIds = response.orders
                        .map(o => o.id)
                        .filter(id => !enrichedOrders[id]);
                    
                    if (missingIds.length > 0) {
                        Promise.allSettled(
                            missingIds.map(async (id) => {
                                const detail = await orderApi.getOrderById(id);
                                set((state) => ({
                                    enrichedOrders: { ...state.enrichedOrders, [id]: detail }
                                }));
                            })
                        );
                    }

                } catch (error: any) {
                    console.error('[useOrderStore] fetch failed:', error.message);
                    if (!backgroundSync) {
                        set({ error: error.message || 'Failed to fetch orders' });
                    }
                    console.error('Failed to load orders:', error);
                } finally {
                    if (!backgroundSync) {
                        set({ loading: false });
                    }
                    set({ isFetching: false });
                }
            },

            loadMoreOrders: async () => {
                const { pagination, loading, isFetching, selectedStatus } = get();
                if (loading || isFetching || !pagination || !pagination.has_next) return;

                await get().fetchOrders({
                    page: pagination.page + 1,
                    per_page: pagination.per_page,
                    status: selectedStatus,
                });
            },

            refreshOrders: async () => {
                set({ refreshing: true });
                const { selectedStatus, pagination } = get();

                try {
                    await get().fetchOrders({
                        page: 1,
                        per_page: pagination?.per_page || 10,
                        status: selectedStatus,
                        forceRefresh: true,
                    });
                } finally {
                    set({ refreshing: false });
                }
            },

            fetchOrderById: async (id: number | string) => {
                set({ isFetchingOrder: true, orderError: null });
                try {
                    const order = await orderApi.getOrderById(id);
                    set({ activeOrder: order });
                } catch (error: any) {
                    console.error('Failed to load order:', error);
                    set({
                        orderError: 'Failed to load order details. Please try again.',
                        activeOrder: null,
                    });
                } finally {
                    set({ isFetchingOrder: false });
                }
            },

            clearActiveOrder: () => set({ activeOrder: null, orderError: null }),

            relaunchOrder: async (orderId: number) => {
                try {
                    await orderApi.relaunchOrders({ order_ids: [orderId] });
                    return { success: true };
                } catch (error: any) {
                    // Suppress console.error so it doesn't trigger the Expo RedBox.
                    // We already handle the error gracefully in the UI.
                    const errorMessage = error.message || 'Failed to relaunch campaign. Please try again.';
                    return { success: false, error: errorMessage };
                }
            },
        }),
        {
            name: 'advertiser-orders-cache',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
            // Only persist actual data — NOT loading/UI states
            partialize: (state) => ({
                orders: state.orders,
                pagination: state.pagination,
                lastFetchedAt: state.lastFetchedAt,
                enrichedOrders: state.enrichedOrders,
            }),
        }
    )
);

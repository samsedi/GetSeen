import { useOrderStore } from '../useOrderStore';
import orderApi from '@/api/orderService';

// Mock dependencies
jest.mock('@/api/orderService', () => ({
    getOrders: jest.fn()
}));
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('useOrderStore', () => {
    beforeEach(() => {
        // Reset state and mocks before each test
        jest.clearAllMocks();
        // Since useOrderStore uses persist, we can manually reset the state we care about
        useOrderStore.setState({
            orders: [],
            loading: true, // Start true to ensure it flips to false
            isFetching: false,
            error: null,
            lastFetchedAt: null
        });
    });

    it('sets error state when fetchOrders fails', async () => {
        const errorMessage = 'Network Error: Server Down';
        
        // Mock the API to reject
        (orderApi.getOrders as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        // Call fetchOrders
        await useOrderStore.getState().fetchOrders({ forceRefresh: true });

        // Verify the store state
        const state = useOrderStore.getState();
        expect(state.error).toBe(errorMessage);
        expect(state.loading).toBe(false);
        expect(state.orders).toEqual([]); // Should remain empty
    });

    it('clears error state on successful fetch', async () => {
        // Start with an error
        useOrderStore.setState({ error: 'Previous Error' });

        // Mock API to succeed
        (orderApi.getOrders as jest.Mock).mockResolvedValueOnce({
            orders: [{ id: 1 }],
            pagination: { page: 1, has_next: false }
        });

        await useOrderStore.getState().fetchOrders({ forceRefresh: true });

        const state = useOrderStore.getState();
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.orders.length).toBe(1);
    });

    it('loadMoreOrders ignores calls if already loading', async () => {
        // Force the store into a loading state with pagination that allows next page
        useOrderStore.setState({
            loading: true,
            pagination: { page: 1, per_page: 10, total: 20, pages: 2, has_next: true, has_prev: false }
        });

        // Call loadMoreOrders
        await useOrderStore.getState().loadMoreOrders();

        // The API should NEVER be called because it blocked the duplicate request
        expect(orderApi.getOrders).not.toHaveBeenCalled();
    });

    it('loadMoreOrders ignores calls while a background sync is still in flight, even though loading stays false', async () => {
        // Reproduces the real-world race: `loading` only flips to true when the list is
        // empty, so with cached orders already present it stays false during a background
        // sync — `isFetching` is the only thing guarding against an overlapping loadMore.
        useOrderStore.setState({
            loading: false,
            isFetching: true,
            pagination: { page: 1, per_page: 10, total: 20, pages: 2, has_next: true, has_prev: false }
        });

        await useOrderStore.getState().loadMoreOrders();

        expect(orderApi.getOrders).not.toHaveBeenCalled();
    });

    it('drops a fetch that starts while another fetch for this store is still in flight', async () => {
        let resolveFirst: (v: any) => void = () => {};
        const firstCall = new Promise((resolve) => { resolveFirst = resolve; });

        (orderApi.getOrders as jest.Mock).mockImplementationOnce(() => firstCall);

        const first = useOrderStore.getState().fetchOrders({ page: 1, forceRefresh: true });

        // Starts while the first request is still pending — must be dropped rather than
        // racing with it and potentially overwriting its result depending on resolve order.
        await useOrderStore.getState().fetchOrders({ page: 2, forceRefresh: true });
        expect(orderApi.getOrders).toHaveBeenCalledTimes(1);

        resolveFirst({
            orders: [{ id: 1 }],
            pagination: { page: 1, per_page: 10, total: 1, pages: 1, has_next: false, has_prev: false },
        });
        await first;

        expect(useOrderStore.getState().orders).toEqual([{ id: 1 }]);
    });
});

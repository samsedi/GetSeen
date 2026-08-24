import { useAdvertiserScreenStore } from '../useAdvertiserScreenStore';
import advertiserScreenApi from '@/api/advertiserScreenService';

jest.mock('@/api/advertiserScreenService', () => ({
    __esModule: true,
    default: {
        getScreens: jest.fn(),
        getScreenById: jest.fn(),
    },
}));
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('useAdvertiserScreenStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAdvertiserScreenStore.setState({
            screens: [],
            pagination: null,
            loading: false,
            isFetching: false,
            error: null,
            lastFetchedAt: null,
        });
    });

    it('loadLessScreens derives has_next from total pages instead of hardcoding true', () => {
        useAdvertiserScreenStore.setState({
            screens: new Array(20).fill(0).map((_, i) => ({ id: String(i) })) as any,
            pagination: { page: 2, per_page: 10, total: 20, pages: 2, has_next: false, has_prev: true },
        });

        useAdvertiserScreenStore.getState().loadLessScreens();

        const { pagination, screens } = useAdvertiserScreenStore.getState();
        expect(pagination?.page).toBe(1);
        expect(pagination?.has_next).toBe(true); // page 2, which we just left, still exists
        expect(screens.length).toBe(10);
    });

    it('does not report a next page when there truly is none left after going back', () => {
        // Only one page ever existed — going "back" from it should be a no-op,
        // but if it weren't guarded, has_next must reflect that no page 2 exists.
        useAdvertiserScreenStore.setState({
            screens: new Array(5).fill(0).map((_, i) => ({ id: String(i) })) as any,
            pagination: { page: 1, per_page: 10, total: 5, pages: 1, has_next: false, has_prev: false },
        });

        useAdvertiserScreenStore.getState().loadLessScreens();

        // page <= 1, so the action is a no-op and state is untouched
        const { pagination } = useAdvertiserScreenStore.getState();
        expect(pagination?.page).toBe(1);
        expect(pagination?.has_next).toBe(false);
    });

    it('drops a fetch that starts while another fetch for this store is still in flight', async () => {
        let resolveFirst: (v: any) => void = () => {};
        const firstCall = new Promise((resolve) => { resolveFirst = resolve; });

        (advertiserScreenApi.getScreens as jest.Mock).mockImplementationOnce(() => firstCall);

        // Kick off a fetch that stays pending (in flight, not yet resolved)
        const first = useAdvertiserScreenStore.getState().fetchScreens({ page: 1, forceRefresh: true });

        // A second fetch starts while the first is still in flight — must be dropped,
        // not race with it and possibly overwrite its result.
        await useAdvertiserScreenStore.getState().fetchScreens({ page: 2, forceRefresh: true });
        expect(advertiserScreenApi.getScreens).toHaveBeenCalledTimes(1);

        resolveFirst({
            screens: [{ id: 'first' }],
            pagination: { page: 1, per_page: 10, total: 1, pages: 1, has_next: false, has_prev: false },
        });
        await first;

        expect(useAdvertiserScreenStore.getState().screens).toEqual([{ id: 'first' }]);
    });

    it('allows a new fetch once the in-flight one has finished', async () => {
        (advertiserScreenApi.getScreens as jest.Mock).mockResolvedValue({
            screens: [{ id: 'a' }],
            pagination: { page: 1, per_page: 10, total: 1, pages: 1, has_next: false, has_prev: false },
        });

        await useAdvertiserScreenStore.getState().fetchScreens({ page: 1, forceRefresh: true });
        await useAdvertiserScreenStore.getState().fetchScreens({ page: 1, forceRefresh: true });

        expect(advertiserScreenApi.getScreens).toHaveBeenCalledTimes(2);
        expect(useAdvertiserScreenStore.getState().isFetching).toBe(false);
    });
});

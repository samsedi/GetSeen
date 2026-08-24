import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useWishlistScreen } from '../useWishlistScreen';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAdvertiserScreenStore } from '@/store/useAdvertiserScreenStore';
import { ScreenResponseDto } from '@/api/screenService';

jest.mock('expo-router', () => ({
    useRouter: () => ({}),
}));

const screen = (id: string) => ({ id } as ScreenResponseDto);

describe('useWishlistScreen', () => {
    beforeEach(() => {
        useWishlistStore.setState({ wishlist: [] });
        useAdvertiserScreenStore.setState({ screens: [screen('a'), screen('b'), screen('c')] });
    });

    it('refreshes recommendations when the wishlisted item changes, even if the count stays the same', async () => {
        useWishlistStore.setState({ wishlist: [screen('a')] });

        const { result } = await renderHook(() => useWishlistScreen());

        await waitFor(() => {
            expect(result.current.recommendedScreens.map((s) => s.id)).toEqual(['b', 'c']);
        });

        // Swap the wishlisted item a -> b. Same count (1 item), different id.
        await act(() => {
            useWishlistStore.setState({ wishlist: [screen('b')] });
        });

        await waitFor(() => {
            expect(result.current.recommendedScreens.map((s) => s.id)).toEqual(['a', 'c']);
        });
    });
});

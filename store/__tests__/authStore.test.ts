import { useAuthStore } from '../authStore';
import * as SecureStore from 'expo-secure-store';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('@/api/authService', () => ({
    logout: jest.fn().mockResolvedValue({ message: 'Logged out' })
}));
jest.mock('@/api/cacheService', () => ({
    clearCache: jest.fn()
}));
jest.mock('expo-router', () => ({
    router: { replace: jest.fn(), push: jest.fn() }
}));

describe('authStore', () => {
    beforeEach(() => {
        // Reset state and mocks before each test
        jest.clearAllMocks();
        useAuthStore.setState({
            isLoggedIn: true,
            accessToken: 'dummy_access',
            refreshToken: 'dummy_refresh',
            role: 'advertiser',
            user: { id: 1, name: 'Test User', email: 'test@example.com', phone: '1234', role: 'advertiser' },
            hasHydrated: true
        });
    });

    it('logout() correctly clears state and secure storage', async () => {
        // Run the logout function
        await useAuthStore.getState().logout();

        // Check the state
        const state = useAuthStore.getState();
        expect(state.isLoggedIn).toBe(false);
        expect(state.accessToken).toBeNull();
        expect(state.refreshToken).toBeNull();
        expect(state.user).toBeNull();
        expect(state.role).toBeNull();

        // Check SecureStore calls
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('activeRole');
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userEmail');
    });

    it('logout() calls clearCache to purge MMKV data', async () => {
        const { clearCache } = require('@/api/cacheService');
        await useAuthStore.getState().logout();
        expect(clearCache).toHaveBeenCalled();
    });

    it('hydrate() successfully loads tokens from SecureStore and marks as hydrated', async () => {
        // Start with unhydrated state
        useAuthStore.setState({ hasHydrated: false, isLoggedIn: false, accessToken: null, role: null });

        // Mock SecureStore to return valid session data
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key: string) => {
            if (key === 'userToken') return 'persisted_access';
            if (key === 'refreshToken') return 'persisted_refresh';
            if (key === 'activeRole') return 'ADVERTISER';
            return null;
        });

        // Call hydrate
        await useAuthStore.getState().hydrate();

        // Verify state is successfully hydrated
        const state = useAuthStore.getState();
        expect(state.hasHydrated).toBe(true);
        expect(state.isLoggedIn).toBe(true);
        expect(state.accessToken).toBe('persisted_access');
        expect(state.refreshToken).toBe('persisted_refresh');
        expect(state.role).toBe('advertiser');
    });
});

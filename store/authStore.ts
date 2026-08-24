import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import authApi, { UserDTO } from '@/api/authService';
import { router } from 'expo-router';

// Stores to reset on logout
import { useAmplifyStore } from './useAmplifyStore';
import { useAdvertiserScreenStore } from './useAdvertiserScreenStore';
import { useOrderStore } from './useOrderStore';
import { useOwnerBookingStore } from './useOwnerBookingStore';
import { useOwnerScreenStore } from './useOwnerScreenStore';
import { useOwnerWalletStore } from './useOwnerWalletStore';
import { useReviewStore } from './useReviewStore';
import { useCartStore } from './useCartStore';
import { useQRStore } from './useQRStore';
import { useAppStore } from './appStore';
import { fileSystemStorage } from './fileSystemStorage';
import { clearCache } from '@/api/cacheService';
// Types
// --------------------------------------------------------------------------
interface AuthState {
    role: 'advertiser' | 'owner' | null;
    isLoggedIn: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: UserDTO | null;
    hasHydrated: boolean;

    setRole: (role: 'advertiser' | 'owner') => void;
    login: (data: { accessToken: string; refreshToken: string; user: UserDTO; role: 'advertiser' | 'owner'; }) => Promise<void>;
    logout: () => Promise<void>;
    setTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
    hydrate: () => Promise<void>;
}

// --------------------------------------------------------------------------
// Side Effects (Secure Storage & API)
// --------------------------------------------------------------------------

/**
 * Persists all authentication data (tokens, role, email) into the device's secure storage.
 * This ensures the user stays logged in across app restarts.
 */
const persistAuthData = async (accessToken: string, refreshToken: string, role: string, email: string) => {
    await SecureStore.setItemAsync('userToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('activeRole', role);
    await SecureStore.setItemAsync('userEmail', email);
};

/**
 * Updates the stored tokens. Useful when an access token expires and is refreshed.
 * Optionally saves the new refresh token if one was provided.
 */
const persistTokens = async (accessToken: string, refreshToken?: string) => {
    await SecureStore.setItemAsync('userToken', accessToken);
    if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    }
};

/**
 * Deletes all authentication data from secure storage to wipe the user's session.
 */
const clearAuthData = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('activeRole');
    await SecureStore.deleteItemAsync('userEmail');
};

/**
 * Logs a warning to the console if the backend logout request fails.
 * Does not throw an error because the local logout should still proceed.
 */
const handleLogoutError = (e: any) => {
    console.warn('Backend logout failed or token already invalid', e);
};

/**
 * Executes the logout request against the backend API to invalidate the tokens on the server.
 */
const executeBackendLogout = async () => {
    try {
        await authApi.logout();
    } catch (e) {
        handleLogoutError(e);
    }
};

/**
 * Reads the saved authentication tokens and role from secure storage on app startup.
 */
const readHydrationData = async () => {
    const accessToken = await SecureStore.getItemAsync('userToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const storedRole = await SecureStore.getItemAsync('activeRole');
    return { accessToken, refreshToken, storedRole };
};

/**
 * Updates the Zustand state with the tokens and role found in secure storage.
 * This marks the app as fully hydrated and the user as logged in.
 */
const hydrateWithTokens = (set: any, accessToken: string, refreshToken: string, storedRole: string) => {
    const role: 'advertiser' | 'owner' = storedRole === 'ADVERTISER' ? 'advertiser' : 'owner';
    set({ accessToken, refreshToken, role, isLoggedIn: true, hasHydrated: true });
};

/**
 * Updates the Zustand state to indicate that hydration is complete, even if no tokens were found.
 */
const markAsHydrated = (set: any) => {
    set({ hasHydrated: true });
};

/**
 * Orchestrates the hydration process by reading tokens and updating state accordingly.
 */
const executeHydration = async (set: any) => {
    const { accessToken, refreshToken, storedRole } = await readHydrationData();
    if (accessToken && refreshToken && storedRole) {
        hydrateWithTokens(set, accessToken, refreshToken, storedRole);
    } else {
        markAsHydrated(set);
    }
};

/**
 * Handles errors during hydration by logging a warning and marking hydration as complete to prevent blocking the UI.
 */
const handleHydrationError = (e: any, set: any) => {
    console.warn('Auth hydration failed', e);
    markAsHydrated(set);
};

/**
 * Wraps the hydration logic in a try-catch block to safely attempt rehydrating the session.
 */
const attemptHydration = async (set: any) => {
    try {
        await executeHydration(set);
    } catch (e) {
        handleHydrationError(e, set);
    }
};

// --------------------------------------------------------------------------
// Store
// --------------------------------------------------------------------------
export const useAuthStore = create<AuthState>((set, get) => ({
    role: null,
    isLoggedIn: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    hasHydrated: false,

    /**
     * Updates only the active role in the Zustand state without modifying tokens.
     */
    setRole: (newRole) => set({ role: newRole }),

    /**
     * Executes the login process by persisting data securely and updating the Zustand state.
     */
    login: async ({ accessToken, refreshToken, user, role }) => {
        const storedRoleStr = role === 'advertiser' ? 'ADVERTISER' : 'SCREEN_OWNER';
        await persistAuthData(accessToken, refreshToken, storedRoleStr, user.email);
        set({ accessToken, refreshToken, user, role, isLoggedIn: true });
    },

    /**
     * Refreshes the active tokens in both secure storage and Zustand.
     */
    setTokens: async (accessToken, refreshToken) => {
        await persistTokens(accessToken, refreshToken);
        set({ accessToken, ...(refreshToken ? { refreshToken } : {}) });
    },

    /**
     * Logs the user out completely, clears secure storage, resets state, and routes to the launch screen.
     */
    logout: async () => {
        await executeBackendLogout();
        await clearAuthData();
        
        // Wipe all general API request caches
        clearCache();

        // Wipe file system cache for all Zustand stores
        await fileSystemStorage.clearAllStorage();

        // Wipe all in-memory arrays and objects to prevent cross-account leaks
        useAmplifyStore.setState({ campaigns: [], previousCampaigns: [], activeCampaign: null, activeAnalytics: null });
        useAdvertiserScreenStore.setState({ screens: [] });
        useOrderStore.setState({ orders: [], activeOrder: null, enrichedOrders: {} });
        useOwnerBookingStore.setState({ bookings: [] });
        useOwnerScreenStore.setState({ screens: [] });
        useOwnerWalletStore.setState({ earnings: null, payouts: [] });
        useReviewStore.setState({ advertiserReviews: [], ownerReviews: [] });
        useCartStore.setState({ items: [], subtotal: 0, totalAmount: 0, discount: 0, coupon: null });
        useQRStore.setState({ qrCodes: [] });
        useAppStore.setState({ bootstrapData: null, hasBootstrapped: false });

        set({ isLoggedIn: false, role: null, accessToken: null, refreshToken: null, user: null });
        router.replace('/');
    },

    /**
     * Attempts to hydrate the user's session from secure storage when the app first opens.
     */
    hydrate: async () => {
        await attemptHydration(set);
    },
}));
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
    const { isLoggedIn, role, hasHydrated } = useAuthStore();

    // Wait for tokens to be read from SecureStore before deciding where to route —
    // otherwise a logged-in user gets bounced to /roles on every cold start.
    if (!hasHydrated) {
        return null;
    }

    // If already logged in, redirect to the correct home tab (not the login screen)
    if (isLoggedIn && role === 'advertiser') {
        return <Redirect href="/(tabs)/home" />;
    }

    if (isLoggedIn && role === 'owner') {
        return <Redirect href="/(screen-owner-tabs)/dashboard" />;
    }

    // Not logged in — go to the roles/login screen
    return <Redirect href="/(auth)/roles" />;
}
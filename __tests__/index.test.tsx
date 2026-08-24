import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '@/app/index';
import { useAuthStore } from '@/store/authStore';

// Stand in for expo-router's <Redirect> so we can observe which href it was given,
// without needing a real router/navigation container mounted in the test.
jest.mock('expo-router', () => ({
    Redirect: ({ href }: { href: string }) => {
        const { Text } = require('react-native');
        return <Text testID="redirect">{href}</Text>;
    },
}));

describe('app/index (initial route)', () => {
    it('renders nothing while the auth store has not hydrated yet, even for a logged-in session', async () => {
        useAuthStore.setState({ hasHydrated: false, isLoggedIn: true, role: 'advertiser' });

        const { toJSON, queryByTestId } = await render(<Index />);

        // Must NOT redirect before hydration finishes — otherwise a logged-in user
        // gets bounced to /roles on every cold start before their session loads.
        expect(queryByTestId('redirect')).toBeNull();
        expect(toJSON()).toBeNull();
    });

    it('redirects to roles once hydrated with no session', async () => {
        useAuthStore.setState({ hasHydrated: true, isLoggedIn: false, role: null });

        const { getByTestId } = await render(<Index />);

        expect(getByTestId('redirect').props.children).toBe('/(auth)/roles');
    });

    it('redirects to the advertiser home once hydrated with a valid advertiser session', async () => {
        useAuthStore.setState({ hasHydrated: true, isLoggedIn: true, role: 'advertiser' });

        const { getByTestId } = await render(<Index />);

        expect(getByTestId('redirect').props.children).toBe('/(tabs)/home');
    });

    it('redirects to the owner dashboard once hydrated with a valid owner session', async () => {
        useAuthStore.setState({ hasHydrated: true, isLoggedIn: true, role: 'owner' });

        const { getByTestId } = await render(<Index />);

        expect(getByTestId('redirect').props.children).toBe('/(screen-owner-tabs)/dashboard');
    });
});

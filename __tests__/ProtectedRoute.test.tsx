import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({
    Redirect: ({ href }: { href: string }) => {
        const { Text } = require('react-native');
        return <Text testID="redirect">{href}</Text>;
    },
}));

describe('ProtectedRoute', () => {
    it('renders nothing while the auth store has not hydrated yet, even for a logged-in session', async () => {
        useAuthStore.setState({ hasHydrated: false, isLoggedIn: true });

        const { toJSON, queryByTestId, queryByText } = await render(
            <ProtectedRoute><Text>secret</Text></ProtectedRoute>
        );

        // Must NOT kick the user to /roles before hydration finishes — otherwise a
        // logged-in user gets bounced out of a protected screen on every cold start.
        expect(queryByTestId('redirect')).toBeNull();
        expect(queryByText('secret')).toBeNull();
        expect(toJSON()).toBeNull();
    });

    it('redirects to roles once hydrated with no session', async () => {
        useAuthStore.setState({ hasHydrated: true, isLoggedIn: false });

        const { getByTestId } = await render(
            <ProtectedRoute><Text>secret</Text></ProtectedRoute>
        );

        expect(getByTestId('redirect').props.children).toBe('/(auth)/roles');
    });

    it('renders the protected children once hydrated with a valid session', async () => {
        useAuthStore.setState({ hasHydrated: true, isLoggedIn: true });

        const { getByText } = await render(
            <ProtectedRoute><Text>secret</Text></ProtectedRoute>
        );

        expect(getByText('secret')).toBeTruthy();
    });
});

import React, { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore'; // Ensure this path matches your store

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Read the login state from your global store
    const { isLoggedIn } = useAuthStore();

    // If the user is NOT logged in, immediately kick them back to the auth flow
    if (!isLoggedIn) {
        return <Redirect href="/(auth)/roles" />;
    }

    // If they ARE logged in, render the screen or layout they requested
    return <>{children}</>;
}
import { Stack } from 'expo-router';

export default function HomeSubScreensLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="viewdetails" options={{ headerShown: false }} />
            <Stack.Screen name="reservenow" options={{ headerShown: false }} />
            <Stack.Screen name="wishlist" options={{ headerShown: false }} />
            <Stack.Screen name="QRGenerator" options={{ headerShown: false }} />
        </Stack>
    );
}
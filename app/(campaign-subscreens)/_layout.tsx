import { Stack } from 'expo-router';

export default function CampaignSubscreensLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DigitalScreensCampaign" options={{ headerShown: false }} />
            <Stack.Screen name="AmplifyCampaign" options={{ headerShown: false }} />
            <Stack.Screen name="GeoReachCampaign" options={{ headerShown: false }} />
            <Stack.Screen name="campaign-analytics" options={{ headerShown: false }} />
            <Stack.Screen name="bulkBooking" options={{ headerShown: false }} />
        </Stack>
    );
}

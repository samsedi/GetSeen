import { Stack } from 'expo-router';
export const unstable_settings = {
    initialRouteName: 'roles',
};
export default function AuthScreensLayout() {

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="roles" options={{ headerShown: false }} />
            <Stack.Screen name="advertiser-auth" options={{ headerShown: false }} />
            <Stack.Screen name="screenowner-auth" options={{ headerShown: false }} />
            <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
            <Stack.Screen name="forgotpassword-screenowner" options={{ headerShown: false }}/>
            <Stack.Screen name="verify-otp" options={{headerShown:false}}/>
        </Stack>
    );
}
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, } from 'react-native'; // Added View
import 'react-native-reanimated';
import { GlassAlert } from '@/components/ui/GlassAlert';
import NetworkBanner from '@/components/NetworkBanner';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
    initialRouteName: '(auth)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* 1. Use a View wrapper to ensure the absolute elements stay positioned correctly */}
            <View style={{ flex: 1, backgroundColor: theme.background }}>

                {/* 2. The Stack renders the actual screens */}
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="homeSubScreens" options={{ headerShown: false }} />
                </Stack>

                {/* 3. Global UI elements come LAST so they float ON TOP of the Stack */}
                <NetworkBanner />
                <GlassAlert />

                {/* 4. StatusBar configuration */}
                <StatusBar
                    // 'auto' or dynamic style is better for visibility in both modes
                    style={colorScheme === 'dark' ? 'light' : 'dark'}
                    backgroundColor={theme.brandNavy}
                    translucent={false}
                />
            </View>
        </ThemeProvider>
    );
}
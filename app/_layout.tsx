import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { GlassAlert } from '@/components/ui/GlassAlert';
import NetworkBanner from '@/components/NetworkBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Prevent the native splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: '(auth)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    
    const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        // Here you can do any async initialization (loading fonts, fetching initial tokens, etc.)
        // For now, we just immediately say the app is ready.
        setIsAppReady(true);
    }, []);

    return (
        <ErrorBoundary>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* 1. Use a View wrapper to ensure the absolute elements stay positioned correctly */}
            <View style={{ flex: 1, backgroundColor: theme.background }}>

                {/* 2. The Stack renders the actual screens */}
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(screen-owner-tabs)" options={{headerShown:false}}/>
                    <Stack.Screen name="homeSubScreens" options={{ headerShown: false }} />
                    <Stack.Screen name="screen-owner-homeSubScreens" options={{headerShown:false}}/>
                    <Stack.Screen name="profile-subscreens" options={{headerShown:false}}/>
                </Stack>

                {/* 3. Global UI elements come LAST so they float ON TOP of the Stack */}
                <NetworkBanner />
                <GlassAlert />

                {/* 4. StatusBar configuration */}
                <StatusBar
                    style={colorScheme === 'dark' ? 'light' : 'dark'}
                    backgroundColor={theme.brandNavy}
                    translucent={false}
                />
                
                {/* 5. Custom Animated Splash Screen (sits on top until finished) */}
                {isAppReady && !isSplashAnimationComplete && (
                    <AnimatedSplashScreen onAnimationComplete={() => setIsSplashAnimationComplete(true)} />
                )}
            </View>
        </ThemeProvider>
        </ErrorBoundary>
    );
}
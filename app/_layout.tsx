import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
    initialRouteName: '(auth)',

};

export default function RootLayout() {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="homeSubScreens" options={{ headerShown: false }} />

            </Stack>

            <StatusBar
                style="light"
                backgroundColor={Colors[colorScheme].brandNavy}
                translucent={false}
            />
        </ThemeProvider>
    );
}
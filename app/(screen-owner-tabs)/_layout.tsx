import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ScreenOwnerTabLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    // Screen Owner uses brandNavy as primary tint instead of pink
    const ownerTint = theme.brandNavy;
    const router = useRouter();

    const styles = useMemo(() => createStyles(isTablet, colorScheme, theme, ownerTint), [isTablet, colorScheme, theme, ownerTint]);

    return (
        <>
            <StatusBar
                style="light"
                backgroundColor={theme.brandNavy}
                translucent={false}
            />

            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: ownerTint,
                    tabBarInactiveTintColor: theme.textSecondary,
                    headerShown: false,
                    tabBarButton: HapticTab,
                    tabBarStyle: styles.tabBar,
                    tabBarBackground: () => (
                        <BlurView
                            tint={colorScheme === 'dark' ? 'dark' : 'light'}
                            intensity={80}
                            style={StyleSheet.absoluteFill}
                        />
                    ),
                }}>

                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "grid" : "grid-outline"} size={20} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="bookings"
                    options={{
                        title: 'Bookings',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={20} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="add-screen"
                    options={{
                        title: '',
                        tabBarButton: (props) => (
                            <View style={styles.plusContainer}>
                                <HapticTab 
                                    {...props} 
                                    style={styles.plusCircle}
                                    onPress={(e) => {
                                        // Prevent default tab switch which might preserve old params.
                                        e.preventDefault();
                                        // Force a new "Add Screen" state by passing a fresh timestamp.
                                        router.replace({ 
                                            pathname: '/(screen-owner-tabs)/add-screen', 
                                            params: { draftId: 'NEW', timestamp: Date.now() } 
                                        });
                                    }}
                                >
                                    <Ionicons name="add" size={isTablet ? 36 : 30} color={theme.whiteHeader} />
                                </HapticTab>
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="earnings"
                    options={{
                        title: 'Earnings',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={20} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="owner-profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}

const createStyles = (isTablet: boolean, colorScheme: string, theme: any, ownerTint: string) => {
    const isDark = colorScheme === 'dark';

    return StyleSheet.create({
        tabBar: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: isTablet ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 12,
            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
        },
        plusContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -30,
        },
        plusCircle: {
            width: isTablet ? 64 : 52,
            height: isTablet ? 64 : 52,
            borderRadius: isTablet ? 32 : 29,
            backgroundColor: ownerTint,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: ownerTint,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
        },
    });
};

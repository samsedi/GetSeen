import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TabLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const styles = useMemo(() => createStyles(isTablet, colorScheme, insets.bottom), [isTablet, colorScheme, insets.bottom]);

    return (
        <>
            <StatusBar
                style="light"
                backgroundColor={theme.brandNavy}
                translucent={false}
            />

            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.tint,
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
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="campaign"
                    options={{
                        title: 'Campaigns',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "list" : "list-outline"} size={20} color={color} />
                        ),
                    }}
                />



                {/* ✨ Replaced Notifications with Analytics */}
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={20} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="profile"
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

const createStyles = (isTablet: boolean, colorScheme: string, bottomInset: number) => {
    const isDark = colorScheme === 'dark';

    let paddingBottom = Platform.OS === 'ios' ? 25 : 12;
    let height = isTablet ? 85 : 65;

    if (bottomInset > paddingBottom) {
        height += (bottomInset - paddingBottom);
        paddingBottom = bottomInset;
    }

    return StyleSheet.create({
        tabBar: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: height,
            paddingBottom: paddingBottom,
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
            backgroundColor: Colors.light.tint,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.light.tint,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
        },
    });
};
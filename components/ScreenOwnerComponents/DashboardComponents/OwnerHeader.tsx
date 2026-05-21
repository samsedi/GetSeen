import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Text,
    useWindowDimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme } from '@/constants/theme';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OwnerHeader() {
    const theme = useAppTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const styles = useMemo(
        () => createStyles(isTablet, theme, insets.top),
        [isTablet, theme, insets.top]
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>

                {/* CENTER: Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search your screens or venues"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={styles.searchInput}
                    />
                </View>

                {/* RIGHT: Notifications Action */}
                <View style={styles.rightActions}>
                    <TouchableOpacity 
                        style={styles.profileCircle} 
                        onPress={() => router.push('/(screen-owner-tabs)/dashboard')} // Can be changed later
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={isTablet ? 22 : 20}
                            color="white"
                        />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insetTop: number) => {
    return StyleSheet.create({
        container: {
            backgroundColor: '#D11243', // Pink background
            paddingTop: Platform.OS === 'ios' ? Math.max(insetTop, 20) + 10 : 42,
            paddingHorizontal: isTablet ? 20 : 12,
            paddingBottom: 20,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            borderWidth: 0.5,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            height: isTablet ? 45 : 42,
            marginRight: 7,
            paddingHorizontal: 5,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            color: 'white',
            fontSize: isTablet ? 15 : 12, // Adjusted font size slightly
        },
        rightActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        profileCircle: {
            width: isTablet ? 40 : 34,
            height: isTablet ? 40 : 34,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        badge: {
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: theme.brandNavy,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#D11243',
        },
        badgeText: {
            color: 'white',
            fontSize: 9,
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });
};

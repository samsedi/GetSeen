import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Text,
    useWindowDimensions,
    useColorScheme,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Theme = typeof Colors.light;

export default function HomeHeader() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();

    // 2. Get the exact height of the device's status bar/notch
    const insets = useSafeAreaInsets();

    const handleNavigation = () => router.push('/homeSubScreens/wishlist');

    // 3. Pass insets.top into the style factory so it recalculates if the screen rotates
    const styles = useMemo(
        () => createStyles(isTablet, theme, insets.top),
        [isTablet, theme, insets.top]
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>

                {/* LEFT: Scan QR Code */}
                <TouchableOpacity style={styles.iconCircle} onPress={()=>router.push('/homeSubScreens/QRGenerator')}>
                    <MaterialCommunityIcons name="qrcode-scan" size={isTablet ? 20 : 18} color="white" />
                </TouchableOpacity>

                {/* CENTER: Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search specific location or venue"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={styles.searchInput}
                    />
                </View>

                {/* RIGHT: Actions */}
                <View style={styles.rightActions}>
                    <TouchableOpacity style={[styles.iconCircle, styles.cartMargin]} >
                        <Ionicons name="cart-outline" size={isTablet ? 20 : 16} color="white" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>12</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Heart Circle - Centered */}
                    <TouchableOpacity style={styles.profileCircle} onPress={handleNavigation}>
                        <Ionicons
                            name="heart-outline"
                            size={isTablet ? 22 : 20}
                            color={theme.brandNavy}
                        />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}


const createStyles = (isTablet: boolean, theme: Theme, insetTop: number) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.brandNavy,
            // 5. Use the exact inset for iOS + 10px breathing room. Keep Android at 42.
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
            marginHorizontal: 10,
            paddingHorizontal: 12,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            color: 'white',
            fontSize: isTablet ? 15 : 9.2, // Kept your specific font sizes
        },
        rightActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconCircle: {
            width: isTablet ? 40 : 34,
            height: isTablet ? 40 : 34,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        cartMargin: {
            marginRight: 8,
        },
        profileCircle: {
            width: isTablet ? 40 : 34,
            height: isTablet ? 40 : 34,
            borderRadius: 20,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
        },
        badge: {
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: theme.tint,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: theme.brandNavy,
        },
        badgeText: {
            color: 'white',
            fontSize: 9,
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });
};
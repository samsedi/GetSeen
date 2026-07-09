import { AppTheme, useAppTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useMemo } from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OwnerHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function OwnerHeader({ searchQuery, setSearchQuery }: OwnerHeaderProps) {
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
                    <Ionicons name="search" size={18} color={theme.whiteHeader + '80'} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search your screens or venues"
                        placeholderTextColor={theme.whiteHeader + '80'}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>



            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insetTop: number) => {
    const androidPadding = Math.max(insetTop, StatusBar.currentHeight || 24) + 15;
    const iosPadding = Math.max(insetTop, 20) + 10;

    return StyleSheet.create({
        container: {
            backgroundColor: theme.brandRed,
            paddingTop: Platform.OS === 'ios' ? iosPadding : androidPadding,
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
            backgroundColor: theme.whiteHeader + '1A',
            borderRadius: 20,
            borderWidth: 0.5,
            borderColor: theme.whiteHeader + '33',
            height: isTablet ? 45 : 42,
            marginHorizontal: 15,
            paddingHorizontal: 12,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            color: theme.whiteHeader,
            fontSize: isTablet ? 15 : 12, // Adjusted font size slightly
        },
    });
};

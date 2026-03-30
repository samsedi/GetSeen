import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    useColorScheme,
    useWindowDimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import {useRouter} from "expo-router";



interface ProfileHeaderProps {
    title: string;
    onMenuPress?: () => void;
    onSettingsPress?: () => void;
    tintColor?: string;
}

export default function ProfileHeader({ title, tintColor, onMenuPress, onSettingsPress }: ProfileHeaderProps) {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const router = useRouter();

    // 1. Breakpoint Check
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const activeTint = tintColor || theme.tint;

    // 2. Memoize Styles for Performance
    const styles = useMemo(() => createStyles(isTablet, theme, insets.top), [isTablet, theme, insets.top]);

    return (
        <View style={styles.container}>
            <View style={styles.contentRow}>
                <TouchableOpacity
                    onPress={()=> router.back()}
                    style={styles.menuCircle}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={isTablet ? 22 : 20} color={activeTint} />
                </TouchableOpacity>


                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

                {/* RIGHT: Settings */}
                <TouchableOpacity
                    onPress={onSettingsPress}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="settings-outline" size={isTablet ? 30 : 24} color={activeTint} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any, insetTop: number) => StyleSheet.create({
    container: {
        backgroundColor: theme.background,
        paddingTop: Platform.OS === 'ios' ? insetTop + 10 : 20,
        paddingBottom: isTablet ? 16 : 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.textSecondary + '20', // Very subtle divider
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // On tablets, we don't want the header elements touching the edges
        paddingHorizontal: isTablet ? 20 : 16,
    },
    menuCircle: {



        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: isTablet ? 25: 16,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    iconButton: {
        padding: 3,
    }
});
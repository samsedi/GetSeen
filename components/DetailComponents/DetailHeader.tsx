import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function DetailHeader({ onBack, isTablet }: { onBack: () => void, isTablet: boolean }) {

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const styles = useMemo(() => createStyles(theme, isTablet), [theme, isTablet]);


    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            console.warn("DetailHeader: onBack prop is missing.");
        }
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name="chevron-back"
                    size={isTablet ? 28 : 24}
                    color={theme?.text || '#000'} // Exception: Fallback color
                />
            </TouchableOpacity>

            <Text style={styles.headerTag}>
                LOCATION PREVIEW
            </Text>

            {/* Placeholder to keep title centered */}
            <View style={{ width: isTablet ? 28 : 24 }} />
        </View>
    );
}

const createStyles = (theme: any, isTablet: boolean) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 45,
        paddingHorizontal: 20,
        height: Platform.OS === 'ios' ? 100 : 90,
        backgroundColor: theme?.background || '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: theme?.border || 'transparent', // Subtle separator
    },
    backButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTag: {
        color: '#FF2D55',
        fontSize: isTablet ? 13 : 11,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
});
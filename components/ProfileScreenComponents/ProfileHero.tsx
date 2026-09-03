import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    useWindowDimensions,
    useColorScheme,
    TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ProfileHeroProps {
    name: string;
    company: string;
    imageUrl: string;
    badgeLabel?: string;
    tintColor?: string;
    onEditPress?: () => void; // Trigger for Image Picker or Edit Modal
}

export default function ProfileHero({ name, company, imageUrl, badgeLabel, tintColor, onEditPress }: ProfileHeroProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const activeTint = tintColor || theme.tint;

    const styles = useMemo(() => createStyles(isTablet, theme, activeTint), [isTablet, theme, activeTint]);

    return (
        <View style={styles.container}>
            {/* AVATAR SECTION WITH EDIT TRIGGER */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onEditPress}
                style={styles.avatarWrapper}
            >
                <Image source={{ uri: imageUrl }} style={styles.avatar} />

                {/* EDIT ICON: Positioned top-right */}
                <View style={styles.editBadge}>
                    <MaterialIcons name="edit" size={isTablet ? 18 : 14} color={activeTint} />
                </View>

                {/* VERIFIED ICON: Positioned bottom-right */}
                <View style={styles.verifiedBadge}>
                    <MaterialIcons name="verified" size={isTablet ? 18 : 14} color="white" />
                </View>
            </TouchableOpacity>

            {/* TEXT INFO SECTION */}
            <View style={styles.infoWrapper}>
                <Text style={styles.nameText}>{name}</Text>
                <Text style={styles.companyText}>{company}</Text>

                <View style={styles.badgeRow}>
                    <View style={styles.glassWrapper}>
                        <Text style={styles.premiumText}>{badgeLabel || 'PREMIUM PARTNER'}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any, activeTint: string) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: isTablet ? 40 : 20,
        paddingVertical: isTablet ? 30 : 20,
        backgroundColor: theme.background,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: isTablet ? 140 : 100,
        height: isTablet ? 140 : 100,
        borderRadius: isTablet ? 45 : 35, // Premium "Squircle" shape
        backgroundColor: theme.textSecondary + '10',
    },
    editBadge: {
        position: 'absolute',
        top: isTablet ? 0 : -4,
        right: isTablet ? 0 : -4,
        width: isTablet ? 36 : 28,
        height: isTablet ? 36 : 28,
        borderRadius: isTablet ? 18 : 14,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow to make it pop against the photo
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: isTablet ? 5 : 0,
        right: isTablet ? -8 : -5,
        width: isTablet ? 34 : 26,
        height: isTablet ? 34 : 26,
        borderRadius: isTablet ? 17 : 13,
        backgroundColor: activeTint,
        borderWidth: 3,
        borderColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoWrapper: {
        marginLeft: isTablet ? 30 : 20,
        flex: 1,
    },
    nameText: {
        fontSize: isTablet ? 34 : 26,
        fontWeight: '900',
        color: theme.text,
        letterSpacing: -0.5,
    },
    companyText: {
        fontSize: isTablet ? 20 : 16,
        color: theme.textSecondary,
        marginBottom: isTablet ? 12 : 8,
        fontWeight: '500',
    },
    badgeRow: {
        flexDirection: 'row',
    },
    glassWrapper: {
        backgroundColor: activeTint + '15', // Translucent brand tint
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)', // The "Light Edge" for glass effect
        borderRadius: 20,
        paddingHorizontal: isTablet ? 18 : 12,
        paddingVertical: isTablet ? 8 : 4,
        marginTop: 4,
    },
    premiumText: {
        fontSize: isTablet ? 13 : 10,
        fontWeight: '900',
        color: activeTint,
        letterSpacing: 1.2,
    },
});
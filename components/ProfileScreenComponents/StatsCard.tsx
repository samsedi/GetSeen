import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface StatsCardProps {
    label: string;
    value: string;
    subValue: string;
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
    bgColor?: string; // New prop
    tintColor?: string;
}

export default function StatsCard({ label, value, subValue, iconName, bgColor, tintColor }: StatsCardProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    // If a custom bgColor is provided, we assume it's a dark background
    const isDarkBg = !!bgColor;
    const textColor = isDarkBg ? '#FFFFFF' : theme.text;
    const subTextColor = isDarkBg ? 'rgba(255,255,255,0.7)' : theme.textSecondary;

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: bgColor || theme.background,
                borderColor: isDarkBg ? 'transparent' : theme.textSecondary + '20'
            }
        ]}>
            <MaterialCommunityIcons
                name={iconName}
                size={isTablet ? 80 : 60}
                color={isDarkBg ? 'rgba(255,255,255,0.08)' : (tintColor || theme.tint) + '08'}
                style={styles.bgIcon}
            />

            <Text style={[styles.label, { color: subTextColor }]}>{label}</Text>
            <Text style={[styles.value, { color: textColor }]}>{value}</Text>
            <Text style={[styles.subValue, { color: subTextColor }]}>{subValue}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 20,
        minHeight: 120,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    bgIcon: {
        position: 'absolute',
        top: 10,
        right: -10,
        transform: [{ rotate: '-15deg' }],
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 22,
        fontWeight: '500',
    },
    subValue: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
});
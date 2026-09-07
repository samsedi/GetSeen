import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';

interface SupportButtonProps {
    label: string;
    icon: React.ReactNode;
    bgColor: string;
    tintColor: string;
    onPress?: () => void;
}

export default function SupportButton({ label, icon, bgColor, tintColor, onPress }: SupportButtonProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: bgColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.leftContent}>
                <View style={styles.iconWrapper}>
                    {icon}
                </View>
                <Text style={[styles.label, { color: theme.text, fontSize: isTablet ? 18 : 16 }]}>
                    {label}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 40, // Perfect pill shape
        marginBottom: 12,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 16,
    },
    label: {
        fontWeight: '700',
    },
});
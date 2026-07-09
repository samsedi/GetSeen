import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
                <Text style={[styles.label, { color: '#3B242A', fontSize: isTablet ? 18 : 16 }]}>
                    {label}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="rgba(59, 36, 42, 0.3)" />
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
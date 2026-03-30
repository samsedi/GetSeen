import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

interface ProfileInfoTileProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
    flex?: number;
}

export default function ProfileInfoTile({ label, value, icon, flex = 1 }: ProfileInfoTileProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={[styles.container, { flex }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <View style={styles.valueRow}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <Text
                    style={[styles.value, { color: theme.text, fontSize: isTablet ? 18 : 15 }]}
                    numberOfLines={1}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 6,
    },
    value: {
        fontWeight: '700',
    },
});
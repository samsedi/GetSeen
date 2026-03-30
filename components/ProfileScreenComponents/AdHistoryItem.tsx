import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface AdHistoryItemProps {
    title: string;
    date: string;
    amount: string;
    status: 'ACTIVE' | 'COMPLETED';
    tintColor: string;
}

export default function AdHistoryItem({ title, date, amount, status, tintColor }: AdHistoryItemProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const isActive = status === 'ACTIVE';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
                    borderColor: theme.textSecondary + '15'
                }
            ]}
            activeOpacity={0.7}
        >
            {/* Icon Box with tinted background */}
            <View style={[styles.iconBox, { backgroundColor: tintColor + '10' }]}>
                <Feather name="play-circle" size={isTablet ? 24 : 20} color={tintColor} />
            </View>

            <View style={styles.details}>
                <Text style={[styles.title, { color: theme.text, fontSize: isTablet ? 18 : 16 }]}>
                    {title}
                </Text>
                <Text style={[styles.subText, { color: theme.textSecondary }]}>
                    {date} • {amount}
                </Text>
            </View>

            {/* Status Badge */}
            <View style={[
                styles.statusBadge,
                { backgroundColor: isActive ? '#E6F4EA' : theme.textSecondary + '15' }
            ]}>
                <Text style={[
                    styles.statusText,
                    { color: isActive ? '#1E7E34' : theme.textSecondary }
                ]}>
                    {status}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontWeight: '700',
    },
    subText: {
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});
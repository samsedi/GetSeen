import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface EmptyStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export default function EmptyState({
                                       title = "No Locations Found",
                                       message = "We couldn't find any ad spaces in this area. Try adjusting your filters.",
                                       onRetry
                                   }: EmptyStateProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
                <Ionicons name="search-outline" size={40} color="#FF2D55" />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

            {onRetry && (
                <TouchableOpacity style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Refresh Results</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: 60,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#FF2D55',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
});
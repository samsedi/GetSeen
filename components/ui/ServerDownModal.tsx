import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import apiClient from '@/api/client';

export default function ServerDownModal() {
    const isServerDown = useAppStore(state => state.isServerDown);
    const setServerDown = useAppStore(state => state.setServerDown);
    
    const [isRetrying, setIsRetrying] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            // Ping a lightweight endpoint to check if the server is back up
            await apiClient.get('/bootstrap');
            setServerDown(false);
        } catch (error: any) {
            // If it's still 50x, the interceptor will just re-trigger setServerDown(true)
            console.log("Retry failed");
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <Modal
            visible={isServerDown}
            animationType="fade"
            transparent={true}
        >
            <View style={[styles.overlay, { backgroundColor: theme.background }]}>
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.tint + '15' }]}>
                        <Ionicons name="construct-outline" size={60} color={theme.tint} />
                    </View>
                    
                    <Text style={[styles.title, { color: theme.text }]}>
                        System Maintenance
                    </Text>
                    
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Our servers are currently undergoing routine maintenance or are temporarily unreachable. Please check back in a few minutes!
                    </Text>

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: theme.tint }]}
                        onPress={handleRetry}
                        disabled={isRetrying}
                        activeOpacity={0.8}
                    >
                        {isRetrying ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Retry Connection</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        ...Typography.h1,
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        ...Typography.body,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});

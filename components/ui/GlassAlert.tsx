import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut } from 'react-native-reanimated';
import { useAlertStore } from '@/store/useAlertStore';

const { width } = Dimensions.get('window');

export const GlassAlert = () => {
    const { visible, title, message, hideAlert } = useAlertStore();
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';

    if (!visible) return null;

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
            {/* Darkened Backdrop - slightly darker in dark mode for better contrast */}
            <View style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)' }]} />

            <View style={styles.container}>
                <Animated.View entering={ZoomIn} exiting={ZoomOut }>
                    <BlurView
                        intensity={isDark ? 95 : 80}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.alertBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }]}
                    >
                        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
                            {title}
                        </Text>
                        <Text style={[styles.message, { color: isDark ? '#DDD' : '#333' }]}>
                            {message}
                        </Text>

                        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />

                        <TouchableOpacity onPress={hideAlert} style={styles.button} activeOpacity={0.7}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    alertBox: {
        width: width * 0.75,
        borderRadius: 24,
        paddingTop: 20,
        overflow: 'hidden',
        borderWidth: 0.5,
        alignItems: 'center',
    },
    title: { fontWeight: '600', fontSize: 18, marginBottom: 8 },
    message: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, marginBottom: 20 },
    divider: { height: 0.5, width: '100%' },
    button: { width: '100%', paddingVertical: 12, alignItems: 'center' },
    buttonText: { color: '#007AFF', fontWeight: '600', fontSize: 17 },
});
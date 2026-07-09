import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useAlertStore, AlertButton } from '@/store/useAlertStore';

const { width } = Dimensions.get('window');

export const GlassAlert = () => {
    const { visible, title, message, buttons, hideAlert } = useAlertStore();
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';

    if (!visible) return null;

    // Use provided buttons or fallback to a default "OK" button
    const activeButtons: AlertButton[] = buttons && buttons.length > 0 
        ? buttons 
        : [{ text: 'OK', onPress: hideAlert }];

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill} pointerEvents="auto">
            {/* Darkened Backdrop */}
            <View style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)' }]} />

            <View style={styles.container}>
                <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                    <BlurView
                        intensity={isDark ? 95 : 80}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.alertBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }]}
                    >
                        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
                            {title}
                        </Text>
                        
                        {!!message && (
                            <Text style={[styles.message, { color: isDark ? '#DDD' : '#333' }]}>
                                {message}
                            </Text>
                        )}

                        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />

                        <View style={[styles.buttonContainer, activeButtons.length > 2 && { flexDirection: 'column' }]}>
                            {activeButtons.map((btn, index) => {
                                const isDestructive = btn.style === 'destructive';
                                const isCancel = btn.style === 'cancel';
                                const textColor = isDestructive ? '#FF3B30' : isCancel ? (isDark ? '#AAA' : '#666') : '#007AFF';

                                return (
                                    <React.Fragment key={index}>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                hideAlert(); // Hide immediately to prevent double-taps
                                                if (btn.onPress) {
                                                    // Give the closing animation a tiny moment to start before running heavy logic
                                                    setTimeout(() => btn.onPress!(), 50);
                                                }
                                            }} 
                                            style={[styles.button, activeButtons.length <= 2 && { flex: 1 }]} 
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.buttonText, { color: textColor, fontWeight: isCancel ? '400' : '600' }]}>
                                                {btn.text}
                                            </Text>
                                        </TouchableOpacity>
                                        {/* Vertical divider if side-by-side */}
                                        {index < activeButtons.length - 1 && activeButtons.length <= 2 && (
                                            <View style={[styles.vDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />
                                        )}
                                        {/* Horizontal divider if stacked vertically */}
                                        {index < activeButtons.length - 1 && activeButtons.length > 2 && (
                                            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>
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
    title: { fontWeight: '600', fontSize: 18, marginBottom: 8, paddingHorizontal: 20, textAlign: 'center' },
    message: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, marginBottom: 20 },
    divider: { height: 0.5, width: '100%' },
    vDivider: { width: 0.5, height: '100%' },
    buttonContainer: { flexDirection: 'row', width: '100%' },
    button: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    buttonText: { fontSize: 17 },
});
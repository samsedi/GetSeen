import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

export default function NetworkBanner() {
    const [displayState, setDisplayState] = useState<'none' | 'offline' | 'low' | 'restored'>('none');
    const animation = useRef(new Animated.Value(-150)).current;

    // Using a Ref to track "Was I offline?" without triggering re-renders
    const wasOffline = useRef(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isNoConn = state.isConnected === false;
            const isLowConn = state.isConnected === true && state.isInternetReachable === false;

            if (isNoConn || isLowConn) {
                // We are currently having issues
                wasOffline.current = true;
                setDisplayState(isNoConn ? 'offline' : 'low');

                Animated.spring(animation, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 10
                }).start();
            } else {
                // We are connected. Check if we just came back from being offline.
                if (wasOffline.current) {
                    setDisplayState('restored');

                    // Show "Back Online" for 3 seconds, then hide
                    setTimeout(() => {
                        Animated.timing(animation, {
                            toValue: -150,
                            duration: 500,
                            useNativeDriver: true,
                        }).start(() => {
                            setDisplayState('none');
                            wasOffline.current = false;
                        });
                    }, 3000);
                } else {
                    // It was a minor blip or initial load, just keep it hidden
                    setDisplayState('none');
                    animation.setValue(-150);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    // Helper to determine look and feel
    const getConfig = () => {
        switch (displayState) {
            case 'offline':
                return { color: '#FF3B30', text: "No internet connection", icon: "cloud-offline" };
            case 'low':
                return { color: '#FF9500', text: "Low connectivity - check Wi-Fi", icon: "cellular" };
            case 'restored':
                return { color: '#34C759', text: "Back online!", icon: "checkmark-circle" };
            default:
                return null;
        }
    };

    const config = getConfig();
    if (!config) return null;

    return (
        <Animated.View style={[
            styles.banner,
            { transform: [{ translateY: animation }], backgroundColor: config.color }
        ]}>
            <Ionicons name={config.icon as any} size={18} color="white" />
            <Text style={styles.text}>{config.text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'ios' ? 60 : 40, // Better notch handling
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it stays on top
        gap: 10,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    text: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    }
});
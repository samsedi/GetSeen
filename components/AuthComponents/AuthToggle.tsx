import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface AuthToggleProps {
    isSignIn: boolean;
    onToggle: (value: boolean) => void;
    activeColor: string;
    bgColor: string;
}

export default function AuthToggle({ isSignIn, onToggle, activeColor, bgColor }: AuthToggleProps) {
    return (
        <View style={[styles.toggleContainer, { backgroundColor: bgColor }]}>
            <TouchableOpacity
                style={[styles.toggleBtn, isSignIn && styles.toggleBtnActive]}
                onPress={() => onToggle(true)}
                activeOpacity={0.8}
            >
                <Text style={[styles.toggleText, isSignIn && { color: activeColor }]}>
                    Sign In
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.toggleBtn, !isSignIn && styles.toggleBtnActive]}
                onPress={() => onToggle(false)}
                activeOpacity={0.8}
            >
                <Text style={[styles.toggleText, !isSignIn && { color: activeColor }]}>
                    Create Account
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 5,
        marginTop: 30,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    toggleBtnActive: {
        backgroundColor: 'white',
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    toggleText: {
        fontWeight: '700',
        color: '#888',
        fontSize: 15,
    },
});
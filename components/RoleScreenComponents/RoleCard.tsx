import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoleData } from '@/constants/mockData';
import { Colors } from '@/constants/theme';

interface RoleCardProps {
    item: RoleData;
    onPress: () => void;
    isTablet: boolean;
}

export default function RoleCard({ item, onPress, isTablet }: RoleCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const isDarkMode = colorScheme === 'dark';

    if (!item) return null;

    const primaryColor = item.buttonColor[0] || theme.tint;

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: isDarkMode ? 'rgba(25, 25, 25, 0.8)' : theme.card,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderWidth: isDarkMode ? 1.5 : 0,
                marginBottom: isTablet ? 25 : 20,
            }
        ]}>
            {/* 1. TOP TAG */}
            <View style={[
                styles.tagWrapper,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
            ]}>
                <Text style={[styles.tagText, { color: primaryColor }]}>
                    {item.tag || "USER"}
                </Text>
            </View>

            {/* 2. ICON BOX - Matches the InfoCard Square style */}
            <View style={[
                styles.iconSquare,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : item.themeColor }
            ]}>
                <Ionicons
                    name={item.icon || "person"}
                    size={isTablet ? 32 : 28}
                    color={primaryColor}
                />
            </View>

            {/* 3. TEXT CONTENT */}
            <View style={styles.content}>
                <Text style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: isTablet ? 26 : 22 }
                ]}>
                    {item.title}
                </Text>
                <Text style={[
                    styles.cardDescription,
                    { color: theme.textSecondary, fontSize: isTablet ? 16 : 14 }
                ]}>
                    {item.description}
                </Text>
            </View>

            {/* 4. ACTION BUTTON */}
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[styles.button, { backgroundColor: primaryColor }]}
            >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 28, // Matches the smooth corners of your details cards
        padding: 24,
        position: 'relative',
        // Standard Android Shadow
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    tagWrapper: {
        position: 'absolute',
        top: 20,
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    iconSquare: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    content: {
        marginBottom: 25,
    },
    cardTitle: {
        fontWeight: '800',
        marginBottom: 8,
    },
    cardDescription: {
        lineHeight: 22,
        fontWeight: '400',
        width: '90%',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});
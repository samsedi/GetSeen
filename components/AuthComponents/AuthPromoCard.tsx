import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthPromoCardProps {
    title: string;
    subtitle: string;
    bgColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
}

export default function AuthPromoCard({ title, subtitle, bgColor, iconName }: AuthPromoCardProps) {
    return (
        <View style={[styles.promoCard, { backgroundColor:bgColor  }]}>
            <View style={styles.promoContent}>
                <Text style={styles.promoTitle}>{title}</Text>
                <Text style={styles.promoSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons
                name={iconName}
                size={90}
                color="rgba(255,255,255,0.08)"
                style={styles.bgIcon}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    promoCard: {
        borderRadius: 32,
        padding: 30,
        marginTop: 20,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 160,
        justifyContent: 'center',
    },
    promoContent: {
        zIndex: 2, // Keeps text above the faded icon
    },
    promoTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    promoSubtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 15,
        lineHeight: 22,
        paddingRight: 20,
    },
    bgIcon: {
        position: 'absolute',
        right: -15,
        top: -15,
        transform: [{ rotate: '-15deg' }],
        zIndex: 1,
    },
});
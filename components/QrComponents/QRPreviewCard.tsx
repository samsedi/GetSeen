import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export const QRPreviewCard = ({ qrName, websiteUrl, qrCodeDisplayUrl, theme }: any) => (
    <View style={[
        styles.previewContainer,
        {
            backgroundColor: theme.card, // Uses the theme's card color (dark gray/white)
            borderColor: theme.border    // Follows theme border color
        }
    ]}>
        <View style={styles.qrWrapper}>
            {/* We keep this white so external cameras can always scan it */}
            <Image
                source={{ uri: qrCodeDisplayUrl }}
                style={styles.qrImage}
                resizeMode="contain"
            />
        </View>

        <View style={styles.badgeContainer}>
            <Text style={[styles.previewName, { color: theme.text }]}>
                {qrName || "Your Brand Name"}
            </Text>
            <Text style={[styles.previewUrl, { color: theme.textSecondary }]} numberOfLines={1}>
                {websiteUrl || "link.getseen.app/preview"}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    previewContainer: {
        marginBottom: 20,
        alignItems: 'center',
        borderRadius: 24,
        padding: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
    },
    qrWrapper: {
        padding: 12,
        backgroundColor: '#FFFFFF', // High contrast for scanner reliability
        borderRadius: 16,
        marginBottom: 12,
        // Added a slight shadow so the white box looks good on light theme too
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    qrImage: { width: 140, height: 140 },
    badgeContainer: { alignItems: 'center' },
    previewName: {
        fontSize: 16,
        fontWeight: '800'
    },
    previewUrl: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500'
    },
});
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '@/constants/theme';

export default function GeoReachCampaign() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    return (
        <View style={styles.mainContent}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>GeoReach</Text>
            </View>

            {/* EMPTY STATE */}
            <View style={styles.emptyContainer}>
                <View style={styles.illustrationCard}>
                    <View style={styles.innerGraphic}>
                        <Ionicons name="location" size={100} color={theme.tint} style={{opacity: 0.1}} />
                        <Ionicons name="map" size={140} color={theme.tint} style={styles.floatingIcon} />
                    </View>
                </View>
                <Text style={styles.emptyTitle}>Coming Soon</Text>
                <Text style={styles.emptySubtitle}>GeoReach campaigns are under construction.</Text>
            </View>
        </View>
    );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    mainContent: { flex: 1 },
    header: {
        paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 16),
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.textSecondary + '20',
    },
    headerTitle: { 
        color: theme.text, 
        fontSize: 16, 
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: -60 },
    illustrationCard: { width: 280, height: 280, backgroundColor: theme.card, borderRadius: 30, padding: 20, marginBottom: 35, borderWidth: 1, borderColor: theme.border },
    innerGraphic: { flex: 1, backgroundColor: theme.tintLight, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    floatingIcon: { position: 'absolute', bottom: -20 },
    emptyTitle: { ...Typography.h1, color: theme.text, fontSize: 26, textAlign: 'center' },
    emptySubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, fontWeight: '500' },
});

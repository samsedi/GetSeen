import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '@/constants/theme';

export default function AnalyticsScreen() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    return (
        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Analytics</Text>
            </View>

            {/* EMPTY STATE */}
            <View style={styles.emptyContainer}>
                <View style={styles.illustrationCard}>
                    <View style={styles.innerGraphic}>
                        <Ionicons name="pie-chart" size={100} color={theme.tint} style={{opacity: 0.1}} />
                        <Ionicons name="bar-chart" size={140} color={theme.tint} style={styles.floatingIcon} />
                    </View>
                </View>
                <Text style={styles.emptyTitle}>Coming Soon</Text>
                <Text style={styles.emptySubtitle}>Your analytics dashboard is currently under construction.</Text>
            </View>
        </View>
    );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    mainContent: { flex: 1 },
    header: {
        paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 42,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 10,
        minHeight: 50 + (Platform.OS === 'ios' ? insets.top : 42),
    },
    headerTitle: { 
        ...Typography.h2, 
        color: theme.text, 
        fontSize: 20, 
        fontWeight: '800',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        top: Platform.OS === 'ios' ? insets.top + 20 : 52,
        zIndex: -1
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: -60 },
    illustrationCard: { width: 280, height: 280, backgroundColor: theme.card, borderRadius: 30, padding: 20, marginBottom: 35, borderWidth: 1, borderColor: theme.border },
    innerGraphic: { flex: 1, backgroundColor: theme.tintLight, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    floatingIcon: { position: 'absolute', bottom: -20 },
    emptyTitle: { ...Typography.h1, color: theme.text, fontSize: 26, textAlign: 'center' },
    emptySubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, fontWeight: '500' },
});

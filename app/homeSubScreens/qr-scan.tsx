import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    useWindowDimensions,
    useColorScheme,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';

export default function QRDashboard() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    // To avoid SVG, we use a generated QR image URL or a local asset
    const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GS-9928-XP&color=2B4373";

    return (
        <View style={styles.container}>
            {/* 1. HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CAMPAIGN VERIFIER</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 2. MAIN QR DISPLAY CARD */}
                <View style={styles.qrHeroCard}>
                    <View style={styles.qrTopSection}>
                        <View>
                            <Text style={styles.venueName}>Madagascar Rest.</Text>
                            <Text style={styles.idText}>ID: GS-9928-XP</Text>
                        </View>
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    </View>

                    {/* QR IMAGE - No SVG used here */}
                    <View style={styles.qrWrapper}>
                        <Image
                            source={{ uri: qrCodeUrl }}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.scanHint}>
                        Screen owners scan this to confirm playback
                    </Text>
                </View>

                {/* 3. STATS GRID (The 3 cards from your screenshot) */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Active Campaigns</Text>
                    </View>

                    <View style={styles.statRow}>
                        <View style={[styles.statCard, { flex: 1, marginRight: 12 }]}>
                            <Text style={styles.statValue}>5</Text>
                            <Text style={styles.statLabel}>Total QR Codes</Text>
                        </View>
                        <View style={[styles.statCard, { flex: 1.5, backgroundColor: '#2B4373' }]}>
                            <Text style={[styles.statValue, { color: 'white' }]}>₦0.00</Text>
                            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Monthly Spend</Text>
                        </View>
                    </View>
                </View>

                {/* 4. RECENT ACTIVITY LIST */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Verifications</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                </View>

                <View style={styles.activityItem}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>Cafe One Yaba</Text>
                        <Text style={styles.activityTime}>Today, 10:24 PM</Text>
                    </View>
                    <Text style={styles.activityStatus}>Success</Text>
                </View>

            </ScrollView>

            {/* 5. PRIMARY ACTION BUTTON */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.mainBtn} activeOpacity={0.8}>
                    <Ionicons name="share-social" size={20} color="white" style={{ marginRight: 10 }} />
                    <Text style={styles.mainBtnText}>Share Campaign QR</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
    },
    headerTitle: { fontSize: 14, fontWeight: '900', color: theme.text, letterSpacing: 2 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

    // QR Hero Card
    qrHeroCard: {
        backgroundColor: theme.card,
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    qrTopSection: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
    venueName: { fontSize: 18, fontWeight: '800', color: theme.text },
    idText: { fontSize: 12, color: '#FF2D55', fontWeight: '700', marginTop: 2 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 6 },
    liveText: { color: '#4CAF50', fontSize: 10, fontWeight: '900' },

    qrWrapper: {
        marginTop: 30,
        padding: 16,
        backgroundColor: 'white', // White bg for QR readability
        borderRadius: 20,
    },
    qrImage: { width: 180, height: 180 },
    scanHint: { marginTop: 20, fontSize: 12, color: theme.textSecondary, fontWeight: '500' },

    // Stats Grid
    statsGrid: { marginTop: 30 },
    statCard: {
        backgroundColor: theme.card,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 12,
    },
    statRow: { flexDirection: 'row' },
    statValue: { fontSize: 24, fontWeight: '900', color: theme.text },
    statLabel: { fontSize: 12, color: theme.textSecondary, fontWeight: '600', marginTop: 4 },

    // Activity Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
    seeAll: { fontSize: 12, color: '#FF2D55', fontWeight: '700' },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
    },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(76, 175, 80, 0.1)', justifyContent: 'center', alignItems: 'center' },
    activityInfo: { flex: 1, marginLeft: 12 },
    activityTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
    activityTime: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
    activityStatus: { fontSize: 12, fontWeight: '800', color: '#4CAF50' },

    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        backgroundColor: 'transparent',
    },
    mainBtn: {
        backgroundColor: '#FF2D55',
        height: 64,
        borderRadius: 22,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#FF2D55',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    mainBtnText: { color: 'white', fontSize: 16, fontWeight: '800' }
});
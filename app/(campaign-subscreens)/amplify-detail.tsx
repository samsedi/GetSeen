import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAmplifyStore } from '@/store/useAmplifyStore';

export default function AmplifyDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    const { activeCampaign, isFetchingDetail, fetchCampaignById, clearActiveData } = useAmplifyStore();

    useEffect(() => {
        if (id) {
            fetchCampaignById(id);
        }
        return () => clearActiveData();
    }, [id]);

    if (isFetchingDetail || !activeCampaign) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
                    <Ionicons name="arrow-back" size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Campaign Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.campaignName}>{activeCampaign.display_name}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{activeCampaign.status_display}</Text>
                        </View>
                    </View>
                    <Text style={styles.campaignId}>{activeCampaign.campaign_display_name}</Text>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Duration</Text>
                        <Text style={styles.value}>{activeCampaign.start_date} to {activeCampaign.end_date}</Text>
                    </View>
                    <View style={[styles.rowBetween, { marginTop: 8 }]}>
                        <Text style={styles.label}>Paid Amount</Text>
                        <Text style={styles.value}>₦{activeCampaign.paid_price?.toLocaleString()}</Text>
                    </View>
                    {activeCampaign.destination_url && (
                        <View style={[styles.rowBetween, { marginTop: 8 }]}>
                            <Text style={styles.label}>Destination</Text>
                            <Text style={[styles.value, { color: theme.tint, flex: 1, textAlign: 'right', marginLeft: 16 }]} numberOfLines={1}>
                                {activeCampaign.destination_url}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Performance Snapshot */}
                <Text style={styles.sectionTitle}>Performance Snapshot</Text>
                <View style={[styles.card, { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
                    <View style={{ flex: 1, minWidth: '40%' }}>
                        <Text style={styles.label}>Delivered / Total</Text>
                        <Text style={styles.value}>{activeCampaign.impressions_delivered?.toLocaleString() || 0} / {activeCampaign.impressions?.toLocaleString() || 0}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: '40%' }}>
                        <Text style={styles.label}>Reach</Text>
                        <Text style={styles.value}>{activeCampaign.reach?.toLocaleString() || 0}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: '40%' }}>
                        <Text style={styles.label}>Clicks</Text>
                        <Text style={styles.value}>{activeCampaign.clicks?.toLocaleString() || 0}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: '40%' }}>
                        <Text style={styles.label}>CTR</Text>
                        <Text style={styles.value}>{activeCampaign.ctr || 0}%</Text>
                    </View>
                </View>

                {/* Source Screens / Locations */}
                <Text style={styles.sectionTitle}>Target Locations (Source Screens)</Text>
                <View style={styles.card}>
                    {(activeCampaign.source_orders?.length || 0) > 0 ? (
                        activeCampaign.source_orders!.map((source: any, idx: number) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                                <Ionicons name="location-outline" size={16} color={theme.tint} style={{ marginRight: 8 }} />
                                <View>
                                    <Text style={styles.value}>{source.screen_title}</Text>
                                    <Text style={styles.label}>{source.location}</Text>
                                </View>
                            </View>
                        ))
                    ) : (activeCampaign.all_screens?.length || 0) > 0 ? (
                        activeCampaign.all_screens!.map((loc: string, idx: number) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                                <Ionicons name="location-outline" size={16} color={theme.tint} style={{ marginRight: 8 }} />
                                <Text style={styles.value}>{loc}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.label}>No specific locations listed.</Text>
                    )}
                </View>

                {/* Media Files */}
                <Text style={styles.sectionTitle}>Media</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {(activeCampaign.media_files || (activeCampaign.media_preview ? [activeCampaign.media_preview] : []))?.map((media: any, idx: number) => (
                        <View key={idx} style={styles.mediaContainer}>
                            {media.type === 'image' ? (
                                <Image source={{ uri: media.url }} style={styles.mediaImage} />
                            ) : (
                                <View style={styles.mediaVideoFallback}>
                                    <Ionicons name="videocam-outline" size={24} color={theme.textSecondary} />
                                    <Text style={styles.label}>Video File</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: insets.top + 10,
        paddingBottom: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    headerTitle: { ...Typography.h3, color: theme.text },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: theme.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    campaignName: { ...Typography.body, color: theme.text, flex: 1 },
    campaignId: { ...Typography.caption, color: theme.tint, marginTop: 4 },
    statusBadge: { backgroundColor: theme.inputBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { ...Typography.caption, color: theme.textSecondary, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: theme.border, marginVertical: 12 },
    label: { ...Typography.caption, color: theme.textSecondary },
    value: { ...Typography.body, color: theme.text },
    sectionTitle: { ...Typography.body, color: theme.text, marginTop: 8, marginBottom: 12 },
    mediaContainer: { width: 100, height: 100, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
    mediaImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    mediaVideoFallback: { flex: 1, backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center' }
});

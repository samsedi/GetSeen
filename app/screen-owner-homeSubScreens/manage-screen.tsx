import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    FlatList,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAppTheme } from '@/constants/theme';
import { useManageScreen } from '@/hooks/useManageScreen';
import VideoPlayerItem from '@/components/VideoPlayerItem';

const isVideoUrl = (url: string) => url.toLowerCase().includes('.mp4');

export default function ManageSingleScreen() {
    const theme = useAppTheme();
    const { width } = useWindowDimensions();

    const {
        screenId,
        loading,
        screenData,
        activeIndex,
        setActiveIndex,
        flatListRef,
        imageSlots,
        uploadingSlot,
        handleReplaceImageSlot,
        handleDeleteImageSlot,
        handleToggleVisibility,
        handleDelete,
        handleCopyDetails,
        handleEditFull,
        handleDuplicate,
        router
    } = useManageScreen();

    if (loading || !screenData) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.brandNavy} />
            </View>
        );
    }

    const auditColor = screenData.review === 'approved' ? theme.statusGreen : theme.statusWarning;
    const imageWidth = width - 40;
    const slotSize = (width - 40 - 4 * 10) / 5;

    const detailRows: Array<[string, string]> = [
        ['Category', screenData.category?.name || '—'],
        ['Dimensions', screenData.dimensions || '—'],
        ['Orientation', screenData.orientation || '—'],
        ['No. of Screens', screenData.no_of_screens?.toString() || '—'],
        ['Monthly Visitors', screenData.monthly_visitors?.toLocaleString() || '—'],
        ['Target Audience', screenData.target_audience || '—'],
        ['Age Range', screenData.age_range || '—'],
        ['Weekdays Hours', screenData.weekdays_hours || '—'],
        ['Weekends Hours', screenData.weekends_hours || '—'],
        ['Dwell Time', screenData.dwell_time || '—'],
        ['Gender Split', `${screenData.male_percentage ?? '—'}% M / ${screenData.female_percentage ?? '—'}% F`],
        ['Daily Price', screenData.price != null ? `${screenData.pricing?.currency_symbol || '₦'}${screenData.price.toLocaleString()}` : '—'],
        ['Weekly Price', screenData.price_per_week != null ? `${screenData.pricing?.currency_symbol || '₦'}${screenData.price_per_week.toLocaleString()}` : '—'],
        ['Monthly Price', screenData.price_per_month != null ? `${screenData.pricing?.currency_symbol || '₦'}${screenData.price_per_month.toLocaleString()}` : '—'],
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Slot</Text>
                <TouchableOpacity onPress={handleDelete} style={styles.headerIconBtn}>
                    <Ionicons name="trash-outline" size={22} color={theme.statusRed} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.imageWrapper}>
                    {screenData.image_urls && screenData.image_urls.length > 0 ? (
                        <FlatList
                            ref={flatListRef}
                            data={screenData.image_urls}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, index) => index.toString()}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.floor(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                                setActiveIndex(index);
                            }}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={[styles.mainImage, { width: imageWidth }]}
                                    contentFit="cover"
                                />
                            )}
                        />
                    ) : (
                        <View style={[styles.mainImage, { width: imageWidth, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.cardSoft }]}>
                            <Ionicons name="image-outline" size={48} color={theme.textSecondary} />
                            <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 13 }}>No images uploaded</Text>
                        </View>
                    )}

                    <View style={[styles.idBadge, { backgroundColor: theme.brandNavy }]}>
                        <Text style={styles.idBadgeText}>{screenId.substring(0, 8)}</Text>
                    </View>

                    {screenData.image_urls && screenData.image_urls.length > 1 && (
                        <View style={styles.paginationOverlay}>
                            {screenData.image_urls.map((_: any, i: number) => (
                                <View key={i} style={[styles.dot, activeIndex === i && styles.activeDot]} />
                            ))}
                        </View>
                    )}
                </View>

                <View style={[styles.statusCard, { backgroundColor: theme.cardSoft }]}>
                    <View style={styles.cardTopRow}>
                        <View>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>Screen Visibility Status</Text>
                            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                                {screenData.status === 'online' ? 'Screen online.' : 'Screen offline.'}
                            </Text>
                        </View>
                        <Switch
                            value={screenData.status === 'online'}
                            onValueChange={handleToggleVisibility}
                            trackColor={{ false: theme.toggleOff, true: theme.statusGreen }}
                            thumbColor="#FFFFFF"
                            ios_backgroundColor={theme.toggleOff}
                        />
                    </View>

                    <View style={styles.cardBottomRow}>
                        <View style={styles.statBlock}>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>ACTIVE CAMPAIGN LOOPS</Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>0 Ads running</Text>
                        </View>

                        <View style={styles.statBlock}>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>ADMIN AUDIT STATUS</Text>
                            <View style={[styles.auditBadge, { backgroundColor: auditColor + '15' }]}>
                                <Text style={[styles.auditBadgeText, { color: auditColor }]}>
                                    {screenData.review === 'approved' ? 'APPROVED' : screenData.review}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── Manage Media ── */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Manage Media</Text>
                <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
                    Tap a slot to add, replace, or remove a photo or video.
                </Text>
                <View style={styles.mediaGrid}>
                    {imageSlots.map((slot, index) => (
                        <View key={index} style={[styles.mediaSlot, { width: slotSize, height: slotSize, borderColor: theme.border }]}>
                            {uploadingSlot === index ? (
                                <View style={[styles.mediaSlotFill, { backgroundColor: theme.cardSoft, alignItems: 'center', justifyContent: 'center' }]}>
                                    <ActivityIndicator size="small" color={theme.brandNavy} />
                                </View>
                            ) : slot ? (
                                <>
                                    {isVideoUrl(slot.url) ? (
                                        <VideoPlayerItem uri={slot.url} style={styles.mediaSlotFill} shouldPlay={false} />
                                    ) : (
                                        <Image source={{ uri: slot.url }} style={styles.mediaSlotFill} contentFit="cover" />
                                    )}
                                    <TouchableOpacity
                                        style={[styles.slotBadge, styles.slotBadgeEdit, { backgroundColor: theme.brandNavy }]}
                                        onPress={() => handleReplaceImageSlot(index)}
                                    >
                                        <Ionicons name="pencil" size={11} color="#FFFFFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.slotBadge, styles.slotBadgeDelete]}
                                        onPress={() => handleDeleteImageSlot(index)}
                                    >
                                        <Ionicons name="close" size={12} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.mediaSlotFill, styles.addSlot, { borderColor: theme.border }]}
                                    activeOpacity={0.7}
                                    onPress={() => handleReplaceImageSlot(index)}
                                >
                                    <Ionicons name="add" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* ── Screen Details ── */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Screen Details</Text>
                <View style={[styles.detailsCard, { backgroundColor: theme.cardSoft }]}>
                    {detailRows.map(([label, value], i) => (
                        <View key={label} style={[styles.detailRow, i < detailRows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.editFullBtn, { backgroundColor: theme.tint }]}
                    onPress={handleEditFull}
                >
                    <Ionicons name="create-outline" size={18} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.editFullBtnText}>Edit Full Details</Text>
                </TouchableOpacity>

                <View style={styles.bottomActionRow}>
                    <TouchableOpacity
                        style={[styles.copyBtn, { borderColor: theme.border }]}
                        onPress={handleCopyDetails}
                    >
                        <Ionicons name="copy-outline" size={18} color={theme.text} style={{ marginRight: 6 }} />
                        <Text style={[styles.copyBtnText, { color: theme.text }]}>Copy Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.copyBtn, { borderColor: theme.border }]}
                        onPress={handleDuplicate}
                    >
                        <Ionicons name="copy" size={18} color={theme.text} style={{ marginRight: 6 }} />
                        <Text style={[styles.copyBtnText, { color: theme.text }]}>Duplicate Screen</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerIconBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    imageWrapper: { position: 'relative', marginTop: 10, marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
    mainImage: { height: 200 },
    idBadge: { position: 'absolute', bottom: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    idBadgeText: { color: 'white', fontSize: 12, fontWeight: '600' },

    paginationOverlay: { position: 'absolute', bottom: 16, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6, paddingRight: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
    activeDot: { backgroundColor: 'white', width: 8, height: 8, borderRadius: 4 },

    statusCard: { borderRadius: 16, padding: 20, marginBottom: 30 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    cardSubtitle: { fontSize: 13 },
    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBlock: { flex: 1 },
    statLabel: { fontSize: 10, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 },
    statValue: { fontSize: 14, fontWeight: '700' },
    auditBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    auditBadgeText: { fontSize: 11, fontWeight: '800' },

    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
    sectionDesc: { fontSize: 12, marginBottom: 14 },

    mediaGrid: { flexDirection: 'row', gap: 10 },
    mediaSlot: { borderRadius: 12, position: 'relative', overflow: 'visible' },
    mediaSlotFill: { width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' },
    addSlot: { borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    slotBadge: { position: 'absolute', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    slotBadgeEdit: { top: -6, left: -6 },
    slotBadgeDelete: { top: -6, right: -6, backgroundColor: '#E53935' },

    detailsCard: { borderRadius: 16, paddingHorizontal: 16, marginBottom: 24 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, gap: 12 },
    detailLabel: { fontSize: 13, fontWeight: '600' },
    detailValue: { fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },

    editFullBtn: { flexDirection: 'row', height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    editFullBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    bottomActionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    copyBtn: { flex: 1, flexDirection: 'row', height: 52, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    copyBtnText: { fontWeight: '700', fontSize: 14 },
});

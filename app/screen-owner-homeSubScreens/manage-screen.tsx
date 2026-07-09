import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Switch,
    FlatList,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAppTheme } from '@/constants/theme';
import { useManageScreen } from '@/hooks/useManageScreen';

export default function ManageSingleScreen() {
    const theme = useAppTheme();
    const { width } = useWindowDimensions();

    const {
        screenId,
        loading,
        updating,
        screenData,
        form,
        setForm,
        activeIndex,
        setActiveIndex,
        flatListRef,
        handleToggleVisibility,
        handleDelete,
        handleSaveUpdates,
        handleCopyDetails,
        router
    } = useManageScreen();

    if (loading || !screenData) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.brandNavy} />
            </View>
        );
    }

    const auditColor = screenData.verificationStatus === 'VERIFIED' ? theme.statusGreen : theme.statusWarning;
    const imageWidth = width - 40;

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

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.imageWrapper}>
                        {screenData.mediaUrls && screenData.mediaUrls.length > 0 ? (
                            <FlatList
                                ref={flatListRef}
                                data={screenData.mediaUrls}
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

                        {screenData.mediaUrls && screenData.mediaUrls.length > 1 && (
                            <View style={styles.paginationOverlay}>
                                {screenData.mediaUrls.map((_, i) => (
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
                                    {screenData.active ? 'Screen online.' : 'Screen offline.'}
                                </Text>
                            </View>
                            <Switch
                                value={screenData.active}
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
                                        {screenData.verificationStatus === 'VERIFIED' ? 'APPROVED' : screenData.verificationStatus}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Asset Specifications</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Hardware Workspace Title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                            value={form.name}
                            onChangeText={(val) => setForm({ ...form, name: val })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Resolution Array Profile</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                            value={form.resolution}
                            onChangeText={(val) => setForm({ ...form, resolution: val })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Location Metadata Workspace</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                            value={form.address}
                            onChangeText={(val) => setForm({ ...form, address: val })}
                        />
                    </View>

                    <View style={styles.bottomActionRow}>
                        <TouchableOpacity
                            style={[styles.copyBtn, { borderColor: theme.border }]}
                            onPress={handleCopyDetails}
                        >
                            <Ionicons name="copy-outline" size={18} color={theme.text} style={{ marginRight: 6 }} />
                            <Text style={[styles.copyBtnText, { color: theme.text }]}>Copy Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: theme.tint, opacity: updating ? 0.7 : 1 }]}
                            onPress={handleSaveUpdates}
                            disabled={updating}
                        >
                            {updating ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Updates</Text>}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
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

    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    input: { height: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },

    bottomActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 12 },
    copyBtn: { flex: 1, flexDirection: 'row', height: 56, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    copyBtnText: { fontWeight: '700', fontSize: 15 },
    saveBtn: { flex: 1.5, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});
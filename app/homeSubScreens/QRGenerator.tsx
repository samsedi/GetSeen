import React, { useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    TextInput,
    useWindowDimensions,
    useColorScheme,
    Platform,
    KeyboardAvoidingView,
    Modal,
    Pressable
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Theme & Custom Hook
import { Colors } from '@/constants/theme';
import { useQRGenerator } from '@/hooks/useQRGenerator';

// Components & Data
import { SavedQR } from '@/constants/mockData';
import { QRPreviewCard } from '@/components/QrComponents/QRPreviewCard';
import { SavedQRCard } from '@/components/QrComponents/SavedQRCard';

/**
 * 1. Memoized Header Component
 * Prevents the text inputs from losing focus during re-renders.
 */
const ListHeaderComponent = React.memo(function ListHeaderComponent({ qrName, setQrName, websiteUrl, setWebsiteUrl, qrImageUrl, theme, styles }: any) {

    return (
        <View>
            <View style={styles.generatorCard}>
                <QRPreviewCard
                    qrName={qrName}
                    websiteUrl={websiteUrl}
                    qrCodeDisplayUrl={qrImageUrl}
                    theme={theme}
                />

                <Text style={styles.label}>Campaign Name</Text>
                <TextInput
                    style={styles.input}
                    value={qrName}
                    onChangeText={setQrName}
                    placeholder="e.g. Summer Sale"
                    placeholderTextColor={theme.textSecondary}
                />

                <Text style={[styles.label, { marginTop: 15 }]}>Website Link</Text>
                <TextInput
                    style={styles.input}
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="https://..."
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="none"
                />
            </View>

            <Text style={styles.sectionTitle}>My Saved QRs</Text>
        </View>
    );
});

export default function QRGenerator() {
    // --- Hooks & State ---
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const {
        qrName,
        setQrName,
        websiteUrl,
        setWebsiteUrl,
        savedQRs,
        qrImageUrl,
        viewedQR,
        handleCreateQR,
        handleDownload,
        handleView,
        handleDismissView,
        handleReport,
        handleDelete,
        buildQrImageUrl,
    } = useQRGenerator();

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const renderItem = useCallback(({ item }: { item: SavedQR }) => (
        <SavedQRCard
            qr={item}
            theme={theme}
            onDownload={() => handleDownload(item)}
            onView={() => handleView(item)}
            onReport={handleReport}
            onDelete={() => handleDelete(item.id)}
        />
    ), [theme, handleDownload, handleView, handleReport, handleDelete]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Custom Navigation Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Track</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Main Content List */}
            <FlatList
                data={savedQRs}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <ListHeaderComponent
                        qrName={qrName}
                        setQrName={setQrName}
                        websiteUrl={websiteUrl}
                        setWebsiteUrl={setWebsiteUrl}
                        qrImageUrl={qrImageUrl}
                        theme={theme}
                        styles={styles}
                    />
                }
                renderItem={renderItem}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
            />

            {/* Sticky Action Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.mainBtn} onPress={handleCreateQR} activeOpacity={0.8}>
                    <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.mainBtnText}>Create New QR</Text>
                </TouchableOpacity>
            </View>

            {/* QR Preview Modal */}
            {viewedQR && (
                <Modal
                    visible={true}
                    transparent
                    animationType="fade"
                    onRequestClose={handleDismissView}
                >
                    <Pressable style={styles.modalBackdrop} onPress={handleDismissView}>
                        <Pressable style={[styles.modalCard, { backgroundColor: theme.card }]} onPress={() => {}}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>{viewedQR.name}</Text>
                                <TouchableOpacity onPress={handleDismissView} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalQrContainer}>
                                <Image
                                    source={{ uri: buildQrImageUrl(viewedQR.url) }}
                                    style={styles.modalQrImage}
                                    contentFit="contain"
                                />
                            </View>

                            <Text style={[styles.modalUrl, { color: theme.textSecondary }]} numberOfLines={2}>
                                {viewedQR.url}
                            </Text>

                            <TouchableOpacity
                                style={[styles.modalDownloadBtn, { backgroundColor: '#2B4373' }]}
                                onPress={() => handleDownload(viewedQR)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="download-outline" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.modalDownloadText}>Save to Photos</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
}

/**
 * 2. Dynamic Stylesheet
 */
const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: theme.text
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120 // Space for floating footer
    },
    generatorCard: {
        backgroundColor: theme.card,
        borderRadius: 30,
        padding: 24,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        color: theme.text
    },
    input: {
        backgroundColor: theme.background,
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.border,
        color: theme.text,
        fontSize: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 30,
        marginBottom: 15,
        color: theme.text
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        backgroundColor: theme.background,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    mainBtn: {
        backgroundColor: '#FF2D55',
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800'
    },

    // --- QR Preview Modal ---
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalCard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        flex: 1,
        marginRight: 12,
    },
    modalQrContainer: {
        width: 260,
        height: 260,
        borderRadius: 20,
        backgroundColor: 'white',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalQrImage: {
        width: 228,
        height: 228,
    },
    modalUrl: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalDownloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        width: '100%',
    },
    modalDownloadText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
    },
});
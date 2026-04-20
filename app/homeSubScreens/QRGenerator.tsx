import React, { useState, useMemo, useCallback } from 'react';
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
    KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Theme & Store
import { Colors } from '@/constants/theme';
import { useAlertStore } from '@/store/useAlertStore';

// Components & Data
import { MOCK_SAVED_QRS, SavedQR } from '@/constants/mockData';
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

    // Glass Alert Store
    const showAlert = useAlertStore((state) => state.showAlert);

    const [qrName, setQrName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [savedQRs, setSavedQRs] = useState<SavedQR[]>(MOCK_SAVED_QRS);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    // QR API URL Construction
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(websiteUrl || "https://getseen.app")}&color=2B4373`;

    // --- Handlers ---
    const handleCreateQR = () => {
        if (!qrName || !websiteUrl) {
            showAlert("Missing Info", "Please provide a name and a link to generate your code.");
            return;
        }

        const newQR: SavedQR = {
            id: Math.random().toString(),
            name: qrName,
            url: websiteUrl,
            createdAt: new Date().toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }).replace(',', ' ·'),
            scans: 0
        };

        setSavedQRs([newQR, ...savedQRs]);
        setQrName('');
        setWebsiteUrl('');
        showAlert("Success", "New QR Code has been created and saved!");
    };

    const renderItem = useCallback(({ item }: { item: SavedQR }) => (
        <SavedQRCard
            qr={item}
            theme={theme}
            onDownload={() => showAlert("Download", "Your high-res QR code is being prepared.")}
            onView={() => showAlert("External Link", `Redirecting to: ${item.url}`)}
            onReport={() => showAlert("Analytics", "Loading real-time scan data...")}
            onDelete={() => {
                setSavedQRs(prev => prev.filter(q => q.id !== item.id));
                showAlert("Deleted", "The campaign was successfully removed.");
            }}
        />
    ), [theme, showAlert]);

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
    }
});
import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    useWindowDimensions,
    useColorScheme,
    Platform,
    KeyboardAvoidingView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

import { MOCK_SAVED_QRS, SavedQR } from '@/constants/mockData';
import { QRPreviewCard } from '@/components/QrComponents/QRPreviewCard';
import { SavedQRCard } from '@/components/QrComponents/SavedQRCard';

export default function QRGenerator() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const [qrName, setQrName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [savedQRs, setSavedQRs] = useState<SavedQR[]>(MOCK_SAVED_QRS);

    // Pass the theme to useMemo so styles update on toggle
    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(websiteUrl || "https://getseen.app")}&color=2B4373`;

    const handleCreateQR = () => {
        if (!qrName || !websiteUrl) {
            Alert.alert("Missing Info", "Please provide a name and a link.");
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
        Alert.alert("Success", "New QR Code created and saved!");
    };

    const actions = {
        download: (qr: SavedQR) => Alert.alert("Download", `Saving ${qr.name} to gallery...`),
        view: (qr: SavedQR) => Alert.alert("View", `Opening: ${qr.url}`),
        report: (qr: SavedQR) => Alert.alert("Report", `This QR has ${qr.scans || 0} total scans.`),
        delete: (qr: SavedQR) => {
            Alert.alert("Delete", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => {
                        setSavedQRs(prev => prev.filter(item => item.id !== qr.id));
                    }}
            ]);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Track</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                {savedQRs.map((qr) => (
                    <SavedQRCard
                        key={qr.id}
                        qr={qr}
                        theme={theme}
                        onDownload={() => actions.download(qr)}
                        onView={() => actions.view(qr)}
                        onReport={() => actions.report(qr)}
                        onDelete={() => actions.delete(qr)}
                    />
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.mainBtn} onPress={handleCreateQR}>
                    <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.mainBtnText}>Create New QR</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background // Fixed
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 10
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: theme.text // Fixed
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120
    },
    generatorCard: {
        backgroundColor: theme.card, // Fixed
        borderRadius: 30,
        padding: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: theme.border // Fixed
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        color: theme.text // Fixed
    },
    input: {
        backgroundColor: theme.background, // Fixed
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.border, // Fixed
        color: theme.text // Fixed
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 30,
        marginBottom: 15,
        color: theme.text // Fixed
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        backgroundColor: theme.background, // Fixed
        borderTopWidth: 1,
        borderTopColor: theme.border
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
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    useColorScheme,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAppTheme } from '@/constants/theme';
import { useAlertStore } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/authStore';

import { submitSupportTicket } from '@/api/supportService';

export default function ReportIssueScreen() {
    const theme = useAppTheme();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const role = useAuthStore(state => state.role);
    const activeTint = role === 'advertiser' ? theme.tint : theme.brandNavy;

    const [loading, setLoading] = useState(false);
    const [issueTitle, setIssueTitle] = useState('');
    const [description, setDescription] = useState('');
    const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

    const handlePickScreenshot = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setScreenshotUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!issueTitle || !description) {
            useAlertStore.getState().showAlert("Error", "Please provide a title and description.");
            return;
        }

        setLoading(true);
        try {
            await submitSupportTicket(issueTitle, description, screenshotUri);
            useAlertStore.getState().showAlert("Submitted", "Thank you! Our support team will review your issue shortly.");
            router.back();
        } catch (error) {
            console.error("Failed to submit report:", error);
            useAlertStore.getState().showAlert("Error", "Failed to submit your report. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const inputBgColor = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={activeTint} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Report an Issue</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                        Encountered a bug or an unexpected error? Let us know the details below so we can fix it.
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Issue Title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBgColor, borderColor: theme.border, color: theme.text }]}
                            placeholder="Briefly describe the issue..."
                            placeholderTextColor="#A0A0A0"
                            value={issueTitle}
                            onChangeText={setIssueTitle}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: inputBgColor, borderColor: theme.border, color: theme.text }]}
                            placeholder="Please provide as much detail as possible. Steps to reproduce the issue are very helpful!"
                            placeholderTextColor="#A0A0A0"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Attach Screenshot (Optional)</Text>
                        
                        {screenshotUri ? (
                            <View style={styles.screenshotContainer}>
                                <Image source={{ uri: screenshotUri }} style={styles.screenshotPreview} contentFit="cover" />
                                <TouchableOpacity 
                                    style={styles.removeScreenshotBtn} 
                                    onPress={() => setScreenshotUri(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.uploadBtn, { borderColor: theme.border, backgroundColor: theme.cardSoft }]}
                                onPress={handlePickScreenshot}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="image-outline" size={32} color={theme.textSecondary} />
                                <Text style={[styles.uploadText, { color: theme.textSecondary }]}>Upload Image</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: activeTint }, (!issueTitle || !description) && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading || !issueTitle || !description}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Submit Report</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 5, zIndex: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
    helperText: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
    input: { height: 52, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, fontSize: 16 },
    textArea: { height: 120, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingTop: 16, fontSize: 16 },
    uploadBtn: { height: 100, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    uploadText: { marginTop: 8, fontSize: 14, fontWeight: '500' },
    screenshotContainer: { position: 'relative', width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
    screenshotPreview: { width: '100%', height: '100%' },
    removeScreenshotBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: 12 },
    footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
    submitBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

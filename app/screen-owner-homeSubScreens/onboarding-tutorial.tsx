import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { useAlertStore } from '@/store/useAlertStore';
import { useOwnerDashboardStore } from '@/store/useOwnerDashboardStore';
import ownerTutorialApi, { OnboardingTutorialVideo } from '@/api/ownerTutorialService';

export default function OnboardingTutorialScreen() {
    const theme = useAppTheme();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const completeTutorial = useOwnerDashboardStore((s) => s.completeTutorial);
    const completingTutorial = useOwnerDashboardStore((s) => s.completingTutorial);

    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState<OnboardingTutorialVideo[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const data = await ownerTutorialApi.fetchTutorials();
                const sorted = [...(data?.onboarding_tutorials || [])].sort((a, b) => a.position - b.position);
                setVideos(sorted);
            } catch {
                useAlertStore.getState().showAlert('Error', 'Could not load the onboarding tutorial. Please try again.');
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const isLast = index === videos.length - 1;
    const current = videos[index];

    const handleFinish = async () => {
        const result = await completeTutorial();
        if (result.success) {
            useAlertStore.getState().showAlert(
                'Tutorial Complete',
                'Great job! You can now set up your first screen.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } else {
            useAlertStore.getState().showAlert('Could Not Complete', result.message);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.brandNavy} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Onboarding Tutorial</Text>
                <View style={styles.headerIconBtn} />
            </View>

            {current ? (
                <>
                    <View style={styles.videoWrapper}>
                        <WebView
                            key={current.embed_url}
                            source={{ html: buildEmbedHtml(current.embed_url) }}
                            style={styles.webview}
                            allowsFullscreenVideo
                            javaScriptEnabled
                            mediaPlaybackRequiresUserAction={false}
                            allowsInlineMediaPlayback
                            originWhitelist={['*']}
                        />
                    </View>

                    <View style={styles.body}>
                        <Text style={[styles.stepLabel, { color: theme.textSecondary }]}>
                            Step {index + 1} of {videos.length}
                        </Text>
                        <Text style={[styles.videoTitle, { color: theme.text }]}>{current.title}</Text>

                        <View style={styles.progressRow}>
                            {videos.map((v, i) => (
                                <View
                                    key={v.position}
                                    style={[
                                        styles.progressDot,
                                        { backgroundColor: i <= index ? theme.tint : theme.border },
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        {index > 0 && (
                            <TouchableOpacity
                                style={[styles.secondaryBtn, { borderColor: theme.border }]}
                                onPress={() => setIndex((i) => Math.max(0, i - 1))}
                            >
                                <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: theme.brandNavy }]}
                            disabled={completingTutorial}
                            onPress={() => (isLast ? handleFinish() : setIndex((i) => i + 1))}
                        >
                            {completingTutorial ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.primaryBtnText}>{isLast ? 'Finish' : 'Next'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.textSecondary }}>No tutorial videos are available right now.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const { width } = Dimensions.get('window');

// YouTube's embedded player requires a real parent <iframe> context to complete its
// config handshake; navigating a WebView straight to the embed URL as the top-level
// document triggers "Video Player Configuration Error". Hosting it inside a local
// HTML page fixes that.
function buildEmbedHtml(embedUrl: string) {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden}iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe></body></html>`;
}

const createStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeArea: { flex: 1 },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        headerIconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
        headerTitle: { ...Typography.h3, fontWeight: '700' },
        videoWrapper: { width, height: (width * 9) / 16, backgroundColor: '#000' },
        webview: { flex: 1, backgroundColor: '#000' },
        body: { paddingHorizontal: 20, paddingTop: 16 },
        stepLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
        videoTitle: { ...Typography.h3, fontWeight: '800' },
        progressRow: { flexDirection: 'row', gap: 6, marginTop: 16 },
        progressDot: { flex: 1, height: 4, borderRadius: 2 },
        footer: {
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 20,
            marginTop: 'auto',
        },
        secondaryBtn: {
            flex: 1,
            borderWidth: 1.5,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        secondaryBtnText: { fontSize: 15, fontWeight: '700' },
        primaryBtn: {
            flex: 2,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    });

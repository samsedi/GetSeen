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
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/constants/theme';
import { useAlertStore } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/authStore';

import { submitFeedback } from '@/api/supportService';

export default function GiveFeedbackScreen() {
    const theme = useAppTheme();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const role = useAuthStore(state => state.role);
    const activeTint = role === 'advertiser' ? theme.tint : theme.brandNavy;

    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            useAlertStore.getState().showAlert("Rating Required", "Please select a star rating before submitting.");
            return;
        }

        setLoading(true);
        try {
            await submitFeedback(rating, feedbackText);
            useAlertStore.getState().showAlert("Thank You!", "We appreciate your feedback. It helps us improve Get Seen for everyone.");
            router.back();
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            useAlertStore.getState().showAlert("Error", "Failed to submit feedback. Please try again later.");
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Give Feedback</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                        We would love to hear your thoughts on how we can improve your experience.
                    </Text>

                    <View style={styles.ratingContainer}>
                        <Text style={[styles.label, { color: theme.text, textAlign: 'center', marginBottom: 16 }]}>
                            How would you rate your experience?
                        </Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity 
                                    key={star} 
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.7}
                                    style={styles.starWrapper}
                                >
                                    <Ionicons 
                                        name={rating >= star ? "star" : "star-outline"} 
                                        size={40} 
                                        color={rating >= star ? "#FFD700" : theme.border} 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Share your thoughts (Optional)</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: inputBgColor, borderColor: theme.border, color: theme.text }]}
                            placeholder="What do you love? What could we do better?"
                            placeholderTextColor="#A0A0A0"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={feedbackText}
                            onChangeText={setFeedbackText}
                        />
                    </View>

                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: activeTint }, rating === 0 && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading || rating === 0}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Submit Feedback</Text>}
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
    helperText: { fontSize: 14, lineHeight: 22, marginBottom: 30, textAlign: 'center' },
    ratingContainer: { marginBottom: 40, alignItems: 'center' },
    starsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
    starWrapper: { padding: 5 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
    textArea: { height: 140, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingTop: 16, fontSize: 16 },
    footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
    submitBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

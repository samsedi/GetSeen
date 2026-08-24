import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';
import reviewApi from '@/api/reviewService';
import { useAlertStore } from '@/store/useAlertStore';

interface LeaveReviewModalProps {
    visible: boolean;
    orderId: number | null;
    initialRating?: number;
    initialText?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LeaveReviewModal({
    visible,
    orderId,
    initialRating = 5,
    initialText = '',
    onClose,
    onSuccess
}: LeaveReviewModalProps) {
    const theme = useAppTheme();
    const [rating, setRating] = useState(initialRating);
    const [reviewText, setReviewText] = useState(initialText);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset when modal opens
    React.useEffect(() => {
        if (visible) {
            setRating(initialRating);
            setReviewText(initialText);
            setIsSubmitting(false);
        }
    }, [visible, initialRating, initialText]);

    const handleSubmit = async () => {
        if (!orderId) return;
        
        setIsSubmitting(true);
        try {
            await reviewApi.submitOrderReview(orderId, {
                rating,
                review_text: reviewText.trim()
            });
            useAlertStore.getState().showAlert('Success', 'Your review has been submitted for approval!');
            onSuccess();
        } catch (error: any) {
            useAlertStore.getState().showAlert('Error', error.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalBackground}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalBackgroundInner}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={onClose}
                        />
                        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                            
                            {/* Handle Bar */}
                            <View style={styles.handleContainer}>
                                <View style={[styles.handle, { backgroundColor: theme.textSecondary + '40' }]} />
                            </View>

                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.text }]}>Leave a Review</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                How was your campaign experience on this screen?
                            </Text>

                            {/* Star Rating */}
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={star <= rating ? 'star' : 'star-outline'}
                                            size={48}
                                            color={star <= rating ? '#FFD700' : theme.textSecondary + '50'}
                                            style={styles.starIcon}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Text Input */}
                            <Text style={[styles.label, { color: theme.text }]}>Share your feedback (optional)</Text>
                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: theme.textSecondary + '10',
                                    color: theme.text,
                                    borderColor: theme.textSecondary + '30'
                                }]}
                                placeholder="What went well? What could be improved?"
                                placeholderTextColor={theme.textSecondary + '80'}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={reviewText}
                                onChangeText={setReviewText}
                            />

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    { backgroundColor: theme.tint },
                                    isSubmitting && { opacity: 0.7 }
                                ]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Submit Review</Text>
                                )}
                            </TouchableOpacity>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackgroundInner: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        minHeight: '50%',
    },
    handleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 24,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    starIcon: {
        marginHorizontal: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        marginBottom: 24,
    },
    submitBtn: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

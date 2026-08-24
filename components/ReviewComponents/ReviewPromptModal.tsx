import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ReviewPromptModalProps {
    visible: boolean;
    order: any | null;
    onReview: () => void;
    onRemind: () => void;
    onDismiss: () => void;
}

export default function ReviewPromptModal({
    visible,
    order,
    onReview,
    onRemind,
    onDismiss
}: ReviewPromptModalProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const isDark = colorScheme === 'dark';

    if (!visible || !order) return null;

    const screenTitle = order.items && order.items.length > 0
        ? order.items[0].screen_title
        : 'your recent campaign';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            {/* Full-screen dark blur overlay */}
            <BlurView
                intensity={30}
                tint={isDark ? 'dark' : 'light'}
                style={styles.overlay}
            >
                {/* Card — plain View so colors render correctly */}
                <View style={[
                    styles.card,
                    {
                        backgroundColor: isDark ? '#1E1E23' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        width: isTablet ? 400 : '85%',
                    }
                ]}>
                    {/* Star Icon Badge */}
                    <View style={styles.iconBadge}>
                        <Text style={styles.iconEmoji}>⭐</Text>
                    </View>

                    <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                        How did it go?
                    </Text>

                    <Text style={[styles.subtitle, { color: isDark ? '#ABABAB' : '#555555' }]}>
                        Your campaign on{' '}
                        <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : '#111111' }}>
                            {screenTitle}
                        </Text>
                        {' '}recently completed.{'\n'}We'd love to hear your thoughts!
                    </Text>

                    {/* Primary Pink Button — hardcoded pink so it ALWAYS shows */}
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        activeOpacity={0.85}
                        onPress={onReview}
                    >
                        <Ionicons name="star" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>Leave a Review</Text>
                    </TouchableOpacity>

                    {/* Secondary Button */}
                    <TouchableOpacity
                        style={[
                            styles.secondaryBtn,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7' }
                        ]}
                        activeOpacity={0.85}
                        onPress={onRemind}
                    >
                        <Text style={[styles.secondaryBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                            Remind me later
                        </Text>
                    </TouchableOpacity>

                    {/* Ghost Button */}
                    <TouchableOpacity
                        style={styles.ghostBtn}
                        activeOpacity={0.7}
                        onPress={onDismiss}
                    >
                        <Text style={[styles.ghostBtnText, { color: isDark ? '#777777' : '#999999' }]}>
                            No thanks
                        </Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 28,
        paddingHorizontal: 28,
        paddingVertical: 32,
        alignItems: 'center',
        borderWidth: 1,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.25,
                shadowRadius: 30,
            },
            android: {
                elevation: 20,
            }
        })
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconEmoji: {
        fontSize: 38,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    primaryBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#FF2D55',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    ghostBtn: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    ghostBtnText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

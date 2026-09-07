import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppTheme, Typography, useAppTheme } from '@/constants/theme';
import { DashboardOnboardingInfo } from '@/api/ownerDashboardService';
import { useOwnerDashboardStore } from '@/store/useOwnerDashboardStore';

interface OnboardingChecklistProps {
    onboarding: DashboardOnboardingInfo | null | undefined;
    hasScreens?: boolean;
}

const STEP_META: Record<'profile' | 'tutorial' | 'screen', { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
    profile: { label: 'Complete your profile', icon: 'person-outline' },
    tutorial: { label: 'Watch the onboarding tutorial', icon: 'play-circle-outline' },
    screen: { label: 'Add your first screen', icon: 'tv-outline' },
};

const NEXT_STEP_CTA: Record<string, string> = {
    profile: 'Complete Profile',
    tutorial: 'Watch Tutorial',
    screen: 'Add Your First Screen',
};

export default function OnboardingChecklist({ onboarding, hasScreens }: OnboardingChecklistProps) {
    const theme = useAppTheme();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { dismissedOnboarding, dismissOnboarding } = useOwnerDashboardStore();

    if (!onboarding || onboarding.is_complete || !onboarding.first_time_vendor || hasScreens || dismissedOnboarding) return null;

    const handleContinue = () => {
        switch (onboarding.next_step) {
            case 'profile':
                router.push('/(screen-owner-tabs)/owner-profile');
                break;
            case 'tutorial':
                router.push('/screen-owner-homeSubScreens/onboarding-tutorial');
                break;
            case 'screen':
                router.replace({
                    pathname: '/(screen-owner-tabs)/add-screen',
                    params: { draftId: 'NEW', timestamp: Date.now() },
                });
                break;
        }
    };

    const steps: Array<keyof typeof STEP_META> = ['profile', 'tutorial', 'screen'];
    const ctaLabel = onboarding.next_step ? NEXT_STEP_CTA[onboarding.next_step] : null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Finish Setting Up</Text>
                <TouchableOpacity onPress={dismissOnboarding} style={styles.dismissButton}>
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                {steps.map((key, i) => {
                    const step = onboarding.steps[key];
                    const meta = STEP_META[key];
                    const isCurrent = onboarding.next_step === key;

                    return (
                        <View
                            key={key}
                            style={[styles.stepRow, i < steps.length - 1 && styles.stepRowBorder]}
                        >
                            <View
                                style={[
                                    styles.stepIconWrapper,
                                    step.complete
                                        ? { backgroundColor: theme.statusGreen + '20' }
                                        : step.locked
                                        ? { backgroundColor: theme.border }
                                        : { backgroundColor: theme.tint + '15' },
                                ]}
                            >
                                <Ionicons
                                    name={step.complete ? 'checkmark-circle' : step.locked ? 'lock-closed' : meta.icon}
                                    size={18}
                                    color={step.complete ? theme.statusGreen : step.locked ? theme.textSecondary : theme.tint}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.stepLabel,
                                    { color: step.locked ? theme.textSecondary : theme.text },
                                    step.complete && styles.stepLabelComplete,
                                ]}
                            >
                                {meta.label}
                            </Text>

                            {isCurrent && (
                                <View style={[styles.currentBadge, { backgroundColor: theme.tint }]}>
                                    <Text style={styles.currentBadgeText}>Next</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {ctaLabel && (
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: theme.brandNavy }]}
                        activeOpacity={0.85}
                        onPress={handleContinue}
                    >
                        <Text style={styles.ctaButtonText}>{ctaLabel}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const createStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: { paddingHorizontal: 20, marginTop: 4 },
        headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
        sectionTitle: { ...Typography.h2, color: theme.text, fontSize: 16 },
        dismissButton: { padding: 4 },
        card: {
            backgroundColor: theme.cardSurface,
            borderRadius: 20,
            padding: 16,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
        },
        stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
        stepRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
        stepIconWrapper: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        stepLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
        stepLabelComplete: { textDecorationLine: 'line-through' },
        currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
        currentBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
        ctaButton: {
            marginTop: 8,
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 14,
            paddingVertical: 14,
        },
        ctaButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    });

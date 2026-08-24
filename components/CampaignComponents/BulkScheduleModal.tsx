import React, { useState, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

// ─────────────────────────────────────────────────────────────
// Duration presets (matching the website)
// ─────────────────────────────────────────────────────────────

type DurationType = 'daily' | 'weekly' | 'monthly';

const DURATION_PRESETS: { id: DurationType; label: string; subtitle: string; icon: string }[] = [
    { id: 'daily', label: 'Boost', subtitle: '24 Hours', icon: 'flash-outline' },
    { id: 'weekly', label: 'Campaign', subtitle: '7 Days', icon: 'calendar-outline' },
    { id: 'monthly', label: 'Dominance', subtitle: '30 Days', icon: 'trophy-outline' },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getDaysForDuration = (duration: DurationType): number => {
    switch (duration) {
        case 'daily': return 1;
        case 'weekly': return 7;
        case 'monthly': return 30;
    }
};

const calcEndDate = (startDate: string, duration: DurationType, multiplier: number): string => {
    const start = new Date(startDate);
    const totalDays = getDaysForDuration(duration) * multiplier;
    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);
    return end.toISOString().split('T')[0];
};

const getTomorrowDate = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

const formatDisplayDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const getDurationLabel = (duration: DurationType, multiplier: number): string => {
    const days = getDaysForDuration(duration) * multiplier;
    return `Your campaign will run for ${days} day${days !== 1 ? 's' : ''} (${duration} x${multiplier})`;
};

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface BulkScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onNext: (schedule: {
        duration: DurationType;
        duration_multiplier: number;
        start_date: string;
        end_date: string;
    }) => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function BulkScheduleModal({ visible, onClose, onNext }: BulkScheduleModalProps) {
    const theme = useAppTheme();

    const [duration, setDuration] = useState<DurationType>('weekly');
    const [multiplier, setMultiplier] = useState(1);
    const [startDate, setStartDate] = useState(getTomorrowDate());
    const [showStartPicker, setShowStartPicker] = useState(false);

    const endDate = useMemo(() => calcEndDate(startDate, duration, multiplier), [startDate, duration, multiplier]);

    const handleDurationChange = (d: DurationType) => {
        setDuration(d);
        setMultiplier(1); // Reset multiplier when duration changes
    };

    const handleMultiplierChange = (delta: number) => {
        const next = multiplier + delta;
        if (next >= 1 && next <= 12) {
            setMultiplier(next);
        }
    };

    const handleNext = () => {
        onNext({
            duration,
            duration_multiplier: multiplier,
            start_date: startDate,
            end_date: endDate,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: theme.text }]}>
                                    Select Ad Duration and Schedule
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    This duration will apply to every screen you select next.
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* ─── Ad Duration ─── */}
                        <Text style={[styles.sectionLabel, { color: theme.text }]}>Ad Duration</Text>
                        <View style={styles.durationRow}>
                            {DURATION_PRESETS.map((preset) => {
                                const isActive = duration === preset.id;
                                return (
                                    <TouchableOpacity
                                        key={preset.id}
                                        style={[
                                            styles.durationCard,
                                            {
                                                backgroundColor: isActive ? theme.tint + '10' : theme.card,
                                                borderColor: isActive ? theme.tint : theme.border,
                                                borderWidth: isActive ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => handleDurationChange(preset.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.durationCardLabel, { color: isActive ? theme.tint : theme.text }]}>
                                            {preset.label}
                                        </Text>
                                        <Text style={[styles.durationCardSub, { color: isActive ? theme.tint : theme.textSecondary }]}>
                                            ({preset.subtitle})
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={[styles.durationHint, { color: theme.textSecondary }]}>
                            {duration === 'daily' ? 'Quick visibility boost' :
                             duration === 'weekly' ? 'Sustained visibility and stronger results' :
                             'Maximum exposure and brand dominance'}
                        </Text>

                        {/* ─── Extend Duration ─── */}
                        <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Extend Duration</Text>
                        <View style={styles.multiplierRow}>
                            <TouchableOpacity
                                style={[styles.multiplierBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => handleMultiplierChange(-1)}
                                disabled={multiplier <= 1}
                            >
                                <Ionicons name="remove" size={20} color={multiplier <= 1 ? theme.textSecondary + '40' : theme.tint} />
                            </TouchableOpacity>
                            <View style={[styles.multiplierDisplay, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Text style={[styles.multiplierValue, { color: theme.text }]}>{multiplier}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.multiplierBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => handleMultiplierChange(1)}
                                disabled={multiplier >= 12}
                            >
                                <Ionicons name="add" size={20} color={multiplier >= 12 ? theme.textSecondary + '40' : theme.tint} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.durationHint, { color: theme.textSecondary, marginTop: 8 }]}>
                            {getDurationLabel(duration, multiplier)}
                        </Text>

                        {/* ─── Date Pickers ─── */}
                        <View style={styles.dateSection}>
                            <View style={styles.dateColumn}>
                                <Text style={[styles.sectionLabel, { color: theme.text }]}>Campaign Start Date</Text>
                                <TouchableOpacity
                                    style={[styles.dateInput, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    onPress={() => setShowStartPicker(true)}
                                >
                                    <Text style={[styles.dateInputText, { color: theme.text }]}>
                                        {formatDisplayDate(startDate)}
                                    </Text>
                                    <Ionicons name="calendar" size={18} color={theme.tint} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateColumn}>
                                <Text style={[styles.sectionLabel, { color: theme.text }]}>Campaign End Date</Text>
                                <View style={[styles.dateInput, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.7 }]}>
                                    <Text style={[styles.dateInputText, { color: theme.textSecondary }]}>
                                        {formatDisplayDate(endDate)}
                                    </Text>
                                    <Ionicons name="calendar" size={18} color={theme.textSecondary} />
                                </View>
                            </View>
                        </View>

                        {/* ─── Actions ─── */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.backBtn, { borderColor: theme.border }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.backBtnText, { color: theme.text }]}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.nextBtn, { backgroundColor: theme.tint }]}
                                onPress={handleNext}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextBtnText}>Next</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* ─── Date Picker ─── */}
                    {showStartPicker && (
                        <DateTimePicker
                            value={new Date(startDate + 'T00:00:00')}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS !== 'ios') setShowStartPicker(false);
                                if (selectedDate) {
                                    setStartDate(selectedDate.toISOString().split('T')[0]);
                                }
                            }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '88%',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#D1D5DB',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
        marginLeft: 12,
    },

    // Section label
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },

    // Duration cards
    durationRow: {
        flexDirection: 'row',
        gap: 10,
    },
    durationCard: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 14,
        alignItems: 'center',
    },
    durationCardLabel: {
        fontSize: 14,
        fontWeight: '800',
    },
    durationCardSub: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    durationHint: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
    },

    // Multiplier
    multiplierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    multiplierBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiplierDisplay: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiplierValue: {
        fontSize: 18,
        fontWeight: '800',
    },

    // Dates
    dateSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    dateColumn: {
        flex: 1,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
    },
    dateInputText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Actions
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 32,
        marginBottom: 8,
    },
    backBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    backBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 6,
    },
    nextBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

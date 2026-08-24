import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';

interface CampaignSelectionTypeProps {
    visible: boolean;
    onClose: () => void;
    onSelectBulk: () => void;
    onSelectIndividual: () => void;
}

export default function CampaignSelectionType({ visible, onClose, onSelectBulk, onSelectIndividual }: CampaignSelectionTypeProps) {
    const theme = useAppTheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>
                                Start Digital Screen Campaign
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                Select how you want to run your campaign.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {/* Bulk Selection Card */}
                        <TouchableOpacity
                            style={[styles.optionCard, { borderColor: theme.border, backgroundColor: theme.card }]}
                            onPress={onSelectBulk}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#1A365D' }]}>
                                <Ionicons name="layers" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: theme.text }]}>Bulk selection</Text>
                                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                                    Select multiple screen locations using the same duration and schedule.
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        {/* Individual Selection Card */}
                        <TouchableOpacity
                            style={[styles.optionCard, { borderColor: theme.border, backgroundColor: theme.card }]}
                            onPress={onSelectIndividual}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#E11D48' }]}>
                                <Ionicons name="location" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, { color: theme.text }]}>Individual selection</Text>
                                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                                    Select screen locations using different durations and schedules.
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

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
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
});

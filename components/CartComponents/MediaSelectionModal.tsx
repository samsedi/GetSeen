import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CartItemResponse } from '@/api/cartService';

interface MediaSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDeviceUpload: () => void;
    onSelectPreviousMedia: () => void;
    cartItem: CartItemResponse | null;
}

export default function MediaSelectionModal({
    visible,
    onClose,
    onSelectDeviceUpload,
    onSelectPreviousMedia,
    cartItem
}: MediaSelectionModalProps) {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();

    if (!visible || !cartItem) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
                    
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Upload Media</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            For {cartItem.screenName}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
                        onPress={() => {
                            onClose();
                            setTimeout(onSelectDeviceUpload, 300);
                        }}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.tint + '15' }]}>
                            <Ionicons name="cloud-upload-outline" size={24} color={theme.tint} />
                        </View>
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>Upload from Device</Text>
                            <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>Select a new image or video from your phone</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
                        onPress={() => {
                            onClose();
                            setTimeout(onSelectPreviousMedia, 300);
                        }}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.tint + '15' }]}>
                            <Ionicons name="images-outline" size={24} color={theme.tint} />
                        </View>
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>Previous Media</Text>
                            <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>Reuse media from your past campaigns</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
});

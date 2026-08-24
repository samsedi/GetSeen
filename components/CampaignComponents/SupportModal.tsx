import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/constants/theme';

interface SupportModalProps {
    visible: boolean;
    onClose: () => void;
    status: string; // 'cancelled' or 'rejected'
}

export default function SupportModal({ visible, onClose, status }: SupportModalProps) {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    const actionText = status.toLowerCase() === 'rejected' 
        ? "Your campaign was rejected. Please contact our support team to get clarification or resolve the issue."
        : "Your campaign was cancelled. Please contact our support team to get clarification or resolve the issue.";

    const handleEmail = () => {
        Linking.openURL('mailto:info@trygetseen.com');
    };

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/2347076267899').catch(err => console.error('An error occurred', err));
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
                    
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            Need Help with Your Campaign?
                        </Text>
                        <TouchableOpacity style={styles.closeIconBtn} onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {actionText}
                    </Text>

                    <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.card }]} 
                        onPress={handleEmail}
                        activeOpacity={0.7}
                    >
                        <Image 
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png' }} 
                            style={{ width: 20, height: 20 }} 
                            resizeMode="contain"
                        />
                        <Text style={[styles.actionBtnText, { color: theme.text }]}>
                            info@trygetseen.com
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.card }]} 
                        onPress={handleWhatsApp}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="logo-whatsapp" size={20} color="#4CAF50" />
                        <Text style={[styles.actionBtnText, { color: '#4CAF50' }]}>
                            +234 707 626 7899
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.primaryCloseBtn, { backgroundColor: theme.tint }]} 
                        onPress={onClose}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.primaryCloseBtnText}>Close</Text>
                    </TouchableOpacity>

                </View>
            </View>
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
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 24,
        maxHeight: '90%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        flex: 1,
    },
    closeIconBtn: {
        padding: 4,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        marginBottom: 12,
        gap: 10,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    primaryCloseBtn: {
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    primaryCloseBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    }
});

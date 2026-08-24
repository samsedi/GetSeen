import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ScrollView, useColorScheme, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { TERMS_DATA } from '@/constants/TermsData';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    brandColor?: string;
    data?: Array<{ title: string; content: string }>;
}

export default function TermsModal({ 
    visible, 
    onClose, 
    title = 'General Terms of Service',
    brandColor = '#2B4373',
    data = TERMS_DATA
}: TermsModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { height, width } = useWindowDimensions();
    const isTablet = width >= 600;

    // Theme dynamic colors
    const bgColor = isDark ? '#1C1C1E' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#000000';
    const secondaryTextColor = isDark ? '#aaaaaa' : '#666666';
    const borderColor = isDark ? '#333333' : '#eeeeee';

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={styles.centeredView} pointerEvents="box-none">
                    <View 
                        style={[
                            styles.sheet, 
                            { 
                                backgroundColor: bgColor, 
                                borderColor: borderColor,
                                maxHeight: height * 0.8,
                                width: isTablet ? 600 : width * 0.9,
                            }
                        ]} 
                    >
                        <View style={[styles.header, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close-circle" size={28} color={secondaryTextColor} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView 
                            style={styles.scrollContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={[styles.lastUpdated, { color: secondaryTextColor }]}>Last updated: March 31, 2026</Text>

                            {data.map((section, index) => (
                                <View key={index} style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: brandColor }]}>{section.title}</Text>
                                    <Text style={[styles.sectionText, { color: secondaryTextColor }]}>{section.content}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheet: {
        borderWidth: 1,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    closeBtn: {
        position: 'absolute',
        right: 15,
        padding: 5,
    },
    scrollContainer: {
        flexShrink: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    lastUpdated: {
        fontSize: 13,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 24,
    }
});

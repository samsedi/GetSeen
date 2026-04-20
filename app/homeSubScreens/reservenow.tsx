import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    FlatList,
    Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function reservenow({ visible, onClose, packages, theme, isTablet }: any) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedId, setSelectedId] = useState(packages[0]?.id);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />

                <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {/* DRAG HANDLE */}
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Select Package</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={packages}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => {
                            const isSelected = selectedId === item.id;
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => setSelectedId(item.id)}
                                    style={[
                                        styles.packageCard,
                                        {
                                            backgroundColor: theme.background,
                                            borderColor: isSelected ? '#FF2D55' : theme.border,
                                            borderWidth: isSelected ? 2 : 1
                                        }
                                    ]}
                                >
                                    <View style={styles.cardHeader}>
                                        <Text style={[styles.packageName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={styles.packagePrice}>₦{item.price}</Text>
                                    </View>

                                    <View style={styles.featureList}>
                                        {item.features.map((f: string, i: number) => (
                                            <View key={i} style={styles.featureItem}>
                                                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                                                <Text style={[styles.featureText, { color: theme.textSecondary }]}>{f}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />

                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            const pkg = packages.find((p: any) => p.id === selectedId);
                            console.log("Added to cart:", pkg.name);
                            onClose();
                        }}
                    >
                        <Ionicons name="cart-outline" size={20} color="white" style={{marginRight: 8}} />
                        <Text style={styles.addBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
        borderWidth: 1,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#E1E4E8',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '900' },
    listContent: { paddingBottom: 20 },
    packageCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    packageName: { fontSize: 18, fontWeight: '800' },
    packagePrice: { fontSize: 18, fontWeight: '900', color: '#FF2D55' },
    featureList: { marginTop: 12, gap: 6 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    featureText: { fontSize: 13, fontWeight: '500' },
    addBtn: {
        backgroundColor: '#FF2D55',
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
    },
    addBtnText: { color: 'white', fontSize: 16, fontWeight: '800' }
});
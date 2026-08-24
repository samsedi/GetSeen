import React, { useEffect, useState } from 'react';
import { 
    Modal, View, Text, TouchableOpacity, StyleSheet, 
    FlatList, ActivityIndicator, Image 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import cartService, { PreviousMediaResponse } from '@/api/cartService';

interface PreviousMediaModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMedia: (filename: string) => void;
}

export default function PreviousMediaModal({
    visible,
    onClose,
    onSelectMedia
}: PreviousMediaModalProps) {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    
    const [media, setMedia] = useState<PreviousMediaResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFilename, setSelectedFilename] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            fetchMedia();
            setSelectedFilename(null);
        }
    }, [visible]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await cartService.getPreviousMedia();
            setMedia(res.media);
        } catch (error) {
            console.error('Failed to fetch previous media', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (selectedFilename) {
            onSelectMedia(selectedFilename);
        }
    };

    const renderItem = ({ item }: { item: PreviousMediaResponse }) => {
        const isSelected = selectedFilename === item.filename;

        return (
            <TouchableOpacity 
                style={[styles.mediaItem, { borderColor: isSelected ? theme.tint : 'transparent' }]} 
                onPress={() => setSelectedFilename(item.filename)}
                activeOpacity={0.8}
            >
                <Image 
                    source={{ uri: item.url }} 
                    style={styles.mediaImage} 
                    resizeMode="cover"
                />
                {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: theme.tint }]}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
                
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={28} color={theme.icon} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Previous Media</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Content */}
                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={theme.tint} />
                    </View>
                ) : media.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="images-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No previous media found.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={media}
                        keyExtractor={(item) => item.filename}
                        numColumns={3}
                        renderItem={renderItem}
                        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 100 }]}
                    />
                )}

                {/* Footer / CTA */}
                <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom || 20 }]}>
                    <TouchableOpacity 
                        style={[styles.ctaButton, { backgroundColor: selectedFilename ? theme.tint : theme.border }]} 
                        disabled={!selectedFilename}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.ctaText}>Use Selected Media</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 16,
    },
    listContainer: {
        padding: 10,
    },
    mediaItem: {
        flex: 1,
        aspectRatio: 1,
        margin: 5,
        borderRadius: 12,
        borderWidth: 3,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
    },
    checkCircle: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    ctaButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    ctaText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

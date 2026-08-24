import { MediaItemResponse } from '@/api/mediaService';
import { Colors, Typography } from '@/constants/theme';
import { useMediaStore } from '@/store/useMediaStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const VideoPreview = ({ url }: { url: string }) => {
    const player = useVideoPlayer(url, player => {
        player.loop = true;
        player.play();
    });

    return (
        <VideoView
            style={StyleSheet.absoluteFillObject}
            player={player}
            nativeControls={true}
        />
    );
};

export default function MyMediaScreen() {
    const [selectedMedia, setSelectedMedia] = useState<MediaItemResponse | null>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const { mediaList, isLoading, isFetchingMore, hasFetched, hasMore, fetchMedia, deleteMedia } = useMediaStore();

    useEffect(() => {
        if (!hasFetched) {
            fetchMedia(true);
        }
    }, [hasFetched, fetchMedia]);

    const handleDeleteMedia = (item: MediaItemResponse) => {
        Alert.alert(
            "Delete Media",
            `Are you sure you want to delete this media?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMedia(item.filename, item.media_type);
                        } catch (error: any) {
                            const message = error.response?.data?.error?.message || "Failed to delete media.";
                            Alert.alert("Cannot Delete Media", message);
                        }
                    }
                }
            ]
        );
    };

    const handleLoadMore = () => {
        if (hasMore && !isFetchingMore && !isLoading) {
            fetchMedia(false);
        }
    };

    const handleRefresh = () => {
        fetchMedia(true);
    };

    const renderItem = ({ item }: { item: MediaItemResponse }) => {
        const isVideo = item.media_type === 'video';

        return (
            <TouchableOpacity
                style={styles.cardContainer}
                activeOpacity={0.8}
                onPress={() => setSelectedMedia(item)}
            >
                <BlurView
                    intensity={colorScheme === 'dark' ? 30 : 60}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={[
                        styles.card,
                        {
                            backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)',
                            borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)'
                        }
                    ]}
                >
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.url }} style={styles.image} contentFit="contain" transition={200} cachePolicy="memory-disk" />
                        {isVideo && (
                            <View style={styles.videoOverlay}>
                                <Ionicons name="play-circle" size={40} color="rgba(255, 255, 255, 0.8)" />
                            </View>
                        )}
                        <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(item);
                            }}
                        >
                            <Ionicons name="trash-outline" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.filename, { color: theme.text }]} numberOfLines={1} ellipsizeMode="middle">
                            {item.name || item.filename}
                        </Text>
                        <View style={styles.cardFooter}>
                            <View style={styles.metaRow}>
                                <View style={[styles.badge, { backgroundColor: `${theme.tint}15` }]}>
                                    <Text style={[styles.badgeText, { color: theme.tint }]}>
                                        {item.media_type.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: theme.cardGrid }]}>
                                    <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                                        {item.source}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.previewButton, { backgroundColor: theme.tint }]}>
                                <Ionicons name="eye-outline" size={14} color="#ffffff" />
                                <Text style={styles.previewButtonText}>Preview</Text>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={60} color={theme.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Media Found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Media you upload or use in campaigns will appear here.
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.tint }]}
                    onPress={() => fetchMedia(true)}
                >
                    <Text style={styles.retryButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Media</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading && !isFetchingMore && mediaList.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={mediaList}
                    keyExtractor={(item, index) => `${item.filename}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={isLoading && mediaList.length > 0}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={
                        <View style={styles.footerContainer}>
                            {isFetchingMore && (
                                <ActivityIndicator size="small" color={theme.tint} style={styles.footerLoader} />
                            )}
                            {!isFetchingMore && mediaList.length > 0 && (
                                <TouchableOpacity
                                    style={[styles.loadMoreButton, { backgroundColor: theme.cardSurface, borderColor: theme.tint, borderWidth: 1 }]}
                                    onPress={() => fetchMedia(false)}
                                >
                                    <Text style={[styles.loadMoreText, { color: theme.tint }]}>Load More</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            <Modal
                visible={!!selectedMedia}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedMedia(null)}
            >
                <TouchableWithoutFeedback onPress={() => setSelectedMedia(null)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalContent}>
                                {selectedMedia?.media_type === 'video' ? (
                                    <VideoPreview url={selectedMedia.url} />
                                ) : (
                                    selectedMedia ? (
                                        <Image
                                            source={{ uri: selectedMedia.url }}
                                            style={StyleSheet.absoluteFillObject}
                                            contentFit="contain"
                                            cachePolicy="memory-disk"
                                        />
                                    ) : null
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedMedia(null)}>
                    <Ionicons name="close-circle" size={36} color="#ffffff" />
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        ...Typography.h2,
        fontSize: 20,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 10,
        flexGrow: 1,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardContainer: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    card: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: 'transparent',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        padding: 12,
    },
    filename: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        flex: 1,
    },
    previewButton: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        gap: 4,
    },
    previewButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        marginVertical: 20,
    },
    footerContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadMoreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    loadMoreText: {
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    modalContent: {
        width: '100%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

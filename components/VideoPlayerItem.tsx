import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, View, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerItemProps {
    uri: string;
    style?: ViewStyle | ViewStyle[];
    onFinish?: () => void;
    shouldPlay?: boolean;
    isMuted?: boolean;
}

export default function VideoPlayerItem({ uri, style, onFinish, shouldPlay = true, isMuted = true }: VideoPlayerItemProps) {
    const player = useVideoPlayer(uri, player => {
        player.muted = isMuted;
        if (shouldPlay) {
            player.play();
        }
    });

    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        const subscription = player.addListener('statusChange', (event) => {
            setIsLoading(event.status === 'loading' || event.status === 'idle');
        });
        setIsLoading(player.status === 'loading' || player.status === 'idle');
        return () => subscription.remove();
    }, [player]);

    useEffect(() => {
        if (shouldPlay) {
            player.play();
        } else {
            player.pause();
        }
    }, [shouldPlay, player]);

    useEffect(() => {
        if (!onFinish) return;
        const subscription = player.addListener('playToEnd', () => {
            onFinish();
        });
        return () => subscription.remove();
    }, [player, onFinish]);

    return (
        <View style={style}>
            <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                nativeControls={false}
                contentFit="cover"
            />
            {isLoading && (
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                    <ActivityIndicator size="small" color="#fff" />
                </View>
            )}
        </View>
    );
}

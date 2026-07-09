import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withDelay,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
    onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
    const [isAppReady, setIsAppReady] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    // Shared values for animation
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    useEffect(() => {
        // As soon as this component mounts, we are ready to hide the native splash screen
        // because this component looks exactly like it.
        async function hideNativeSplash() {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('Error hiding native splash screen', e);
            }
            
            // Give a tiny delay for the native splash to disappear smoothly, 
            // then start our custom animation
            setIsAppReady(true);
        }

        hideNativeSplash();
    }, []);

    useEffect(() => {
        if (isAppReady) {
            // Total animation time: 2.0 seconds
            // 0 - 500ms: pause (wait for native splash hide)
            scale.value = withDelay(
                500,
                withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            );
            
            // 1200ms - 2000ms: fade out
            opacity.value = withDelay(
                1200, 
                withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }, (finished) => {
                    if (finished) {
                        runOnJS(onAnimationComplete)();
                    }
                })
            );
        }
    }, [isAppReady, opacity, scale, onAnimationComplete]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const animatedImageStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const logoSource = isDark 
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    return (
        <Animated.View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }, animatedContainerStyle]} pointerEvents="none">
            <Animated.Image 
                source={logoSource}
                style={[styles.image, animatedImageStyle]}
                resizeMode="contain"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it sits on top of everything
    },
    image: {
        width: 200, // Matches imageWidth in app.json
        height: 200, 
    }
});

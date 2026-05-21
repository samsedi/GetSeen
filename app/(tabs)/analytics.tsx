import React from "react";
import {Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import { useAppTheme } from '@/constants/theme';

export default function Notifications() {
    const theme = useAppTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.HomeScreenText, { color: theme.text }]}>Analytics Screen</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    HomeScreenText: {
        alignSelf: 'center',
        fontSize: 18,
    }
});

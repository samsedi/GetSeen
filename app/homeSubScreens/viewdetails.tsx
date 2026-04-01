import React, { useMemo, Suspense, lazy } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, ActivityIndicator, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { MOCK_LOCATIONS } from '@/constants/mockData';

const DetailHeader = lazy(() => import('@/components/DetailComponents/DetailHeader'));
const DetailPoster = lazy(() => import('@/components/DetailComponents/DetailPoster'));
const DetailContent = lazy(() => import('@/components/DetailComponents/DetailContent'));

export default function ViewDetails() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const locationData = useMemo(() => {
        return MOCK_LOCATIONS.find(loc => String(loc.id) === String(id)) || MOCK_LOCATIONS[0];
    }, [id]);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={styles.container}>
            <Suspense fallback={<View style={styles.loaderContainer}><ActivityIndicator size="large" color="#FF2D55" /></View>}>
                <DetailHeader onBack={() => router.back()} isTablet={isTablet} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <DetailPoster isTablet={isTablet} item={locationData} />
                    <DetailContent isTablet={isTablet} data={locationData} />
                </ScrollView>
            </Suspense>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingBottom: 60 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }
});
import React, { useMemo, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '@/constants/theme';
import { useReservationStore } from '@/store/useReservationStore';
import PackageSelectionModal from '@/components/HomeScreenComponents/PackageSelectionModal';
import { MOCK_LOCATIONS } from '@/constants/mockData';

import DetailHeader from '@/components/DetailComponents/DetailHeader';
import DetailPoster from '@/components/DetailComponents/DetailPoster';
import DetailContent from '@/components/DetailComponents/DetailContent';

export default function ViewDetails() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const theme = useAppTheme();

    /**
     * FIX: Do NOT subscribe to activeLocation here.
     *
     * On the detail screen the modal always shows the SAME item —
     * the one already loaded locally as `locationData`. Subscribing
     * to activeLocation means ViewDetails re-renders every time
     * openReservation is called (activeLocation changes), which
     * triggers a full ScrollView + DetailPoster + DetailContent
     * re-render cascade → freeze.
     *
     * We subscribe only to isModalVisible (needed to show/hide) and
     * closeReservation (stable action reference, never causes re-render).
     */
    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    const locationData = useMemo(
        () => MOCK_LOCATIONS.find((loc) => String(loc.id) === String(id)) ?? MOCK_LOCATIONS[0],
        [id],
    );

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const handleBack = useCallback(() => router.back(), [router]);

    return (
        <View style={styles.container}>
            <DetailHeader onBack={handleBack} isTablet={isTablet} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={Platform.OS === 'android'}
            >
                {/*
                 * Both children are React.memo — they will not re-render
                 * when isModalVisible toggles because their props
                 * (isTablet, locationData) haven't changed.
                 */}
                <DetailPoster isTablet={isTablet} item={locationData} />
                <DetailContent isTablet={isTablet} data={locationData} />
            </ScrollView>

            {/*
             * FIX: Pass `locationData` (local, stable) instead of
             * `activeLocation` (store-driven, triggers extra re-renders).
             * The modal on this screen always belongs to the same item.
             */}
            <PackageSelectionModal
                visible={isModalVisible}
                onClose={closeReservation}
                item={locationData}
                theme={theme}
                isTablet={isTablet}
            />
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContent: {
            paddingBottom: 60,
        },
    });

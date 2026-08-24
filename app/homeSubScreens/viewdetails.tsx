import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    useWindowDimensions,
    Platform,
    Text,
} from 'react-native';

import { useAppTheme } from '@/constants/theme';
import PackageSelectionModal from '@/components/HomeScreenComponents/PackageSelectionModal';

import DetailHeader from '@/components/DetailComponents/DetailHeader';
import DetailPoster from '@/components/DetailComponents/DetailPoster';
import DetailContent from '@/components/DetailComponents/DetailContent';

import { useViewDetails } from '@/hooks/useViewDetails';

export default function ViewDetails() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();

    const {
        screen,
        loading,
        error,
        isModalVisible,
        closeReservation,
        handleBack
    } = useViewDetails();

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    // If somehow there's truly no data (edge case), show a short error
    if (!screen) {
        return (
            <View style={styles.container}>
                <DetailHeader onBack={handleBack} isTablet={isTablet} />
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Screen not found.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DetailHeader onBack={handleBack} isTablet={isTablet} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={Platform.OS === 'android'}
            >
                <DetailPoster isTablet={isTablet} item={screen} />
                <DetailContent isTablet={isTablet} data={screen} />
            </ScrollView>

            <PackageSelectionModal
                visible={isModalVisible}
                onClose={closeReservation}
                item={screen}
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
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        errorText: {
            color: theme.textSecondary ?? '#888',
            fontSize: 14,
            textAlign: 'center',
        },
    });
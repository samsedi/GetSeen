import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/constants/theme';

// 1. Import your Sidebar
import CampaignSidebar from '@/components/CampaignComponents/CampaignSidebar';

// 2. Import your three sub-screens (Adjust these paths based on where you saved them!)
import DigitalScreensCampaign from '@/app/(campaign-subscreens)/DigitalScreensCampaign';
import AmplifyCampaign from '@/app/(campaign-subscreens)/AmplifyCampaign';
import GeoReachCampaign from '@/app/(campaign-subscreens)/GeoReachCampaign';

export default function CampaignScreen() {
    const theme = useAppTheme();

    // --- STATE MANAGEMENT ---
    const [selectedType, setSelectedType] = useState('Digital screens');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    // --- SUB-SCREEN ROUTER ---
    const renderActiveScreen = () => {
        switch (selectedType) {
            case 'Amplify':
                return <AmplifyCampaign />;
            case 'GeoReach':
                return <GeoReachCampaign />;
            case 'Digital screens':
            default:
                return <DigitalScreensCampaign />;
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>

            {/* MAIN BACKGROUND CONTENT */}
            <View style={styles.contentContainer}>
                {renderActiveScreen()}
            </View>

            {/* FLOATING SIDEBAR WRAPPER
               pointerEvents="box-none" ensures that touches on the empty space
               pass through to the screen underneath (so you can still scroll the list).
            */}
            <View style={styles.sidebarWrapper} pointerEvents="box-none">
                <CampaignSidebar
                    selectedType={selectedType}
                    onSelectType={(type) => {
                        setSelectedType(type);
                        // Optional: Auto-close sidebar after making a selection
                        // setIsSidebarExpanded(false);
                    }}
                    isExpanded={isSidebarExpanded}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    sidebarWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 150, // Enough width to hold the sidebar + the pop-out tooltip
        zIndex: 100, // Ensures it floats above the header and flatlist
    }
});
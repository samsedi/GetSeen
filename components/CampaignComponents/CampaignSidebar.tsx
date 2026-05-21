import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/constants/theme';

export const CAMPAIGN_TYPES = [
    { id: 'Digital screens', icon: 'desktop-outline' },
    { id: 'Amplify', icon: 'phone-portrait-outline' },
    { id: 'GeoReach', icon: 'location-outline' },
];

interface CampaignSidebarProps {
    selectedType: string;
    onSelectType: (type: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

export default function CampaignSidebar({ selectedType, onSelectType, isExpanded, onToggle }: CampaignSidebarProps) {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    
    return (
        <View style={[
            styles.sidebar, 
            { 
                backgroundColor: theme.card, 
                borderColor: theme.border,
                marginTop: Platform.OS === 'ios' ? insets.top + 10 : 42 
            }
        ]}>
            {/* TOGGLE BUTTON */}
            <TouchableOpacity onPress={onToggle} style={[styles.toggleBtn, { backgroundColor: theme.border }]} activeOpacity={0.7}>
                <Ionicons name="menu-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            
            {isExpanded && (
                <>
                    {/* DIVIDER */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* ICONS CONTAINER */}
                    <View style={styles.iconsContainer}>
                        {CAMPAIGN_TYPES.map((type) => {
                            const isActive = selectedType === type.id;
                            return (
                                <SidebarIcon 
                                    key={type.id}
                                    type={type}
                                    isActive={isActive}
                                    theme={theme}
                                    onSelect={() => onSelectType(type.id)}
                                />
                            );
                        })}
                    </View>
                </>
            )}
        </View>
    );
}

function SidebarIcon({ type, isActive, theme, onSelect }: any) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <View style={{ zIndex: isHovered ? 99 : 1 }}>
            <Pressable
                // @ts-ignore - onHoverIn/Out are React Native Web specific but work via Pressable on supported platforms
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPressIn={() => setIsHovered(true)}
                onPressOut={() => setIsHovered(false)}
                onPress={onSelect}
                style={[
                    styles.sidebarItem, 
                    isActive && { backgroundColor: theme.promoPink + '15' }
                ]}
            >
                <Ionicons 
                    name={type.icon as any} 
                    size={22} 
                    color={isActive ? theme.promoPink : theme.textSecondary} 
                />
            </Pressable>
            
            {/* TOOLTIP */}
            {isHovered && (
                <View style={[styles.tooltip, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.tooltipText, { color: theme.text }]}>{type.id}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 55, 
        borderRadius: 30, 
        alignItems: 'center',
        paddingVertical: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 100,
    },
    toggleBtn: {
        width: 36,
        height: 36,
        borderRadius: 18, // Perfectly round background
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 30,
        height: 1,
        marginVertical: 10,
    },
    iconsContainer: {
        width: '100%',
        gap: 12,
        alignItems: 'center',
    },
    sidebarItem: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tooltip: {
        position: 'absolute',
        left: 50, // Push outside the pill
        top: 2,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: 140, // Fixed width so text doesn't wrap awkwardly
    },
    tooltipText: {
        fontSize: 13,
        fontWeight: '600',
    }
});

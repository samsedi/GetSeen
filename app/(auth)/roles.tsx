import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    useWindowDimensions,
    useColorScheme,
    Image, // 1. Import Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ROLES } from '@/constants/mockData';
import RoleCard from '@/components/RoleScreenComponents/RoleCard';
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography } from '@/constants/theme';

const WORDS = ["EAT", "WORK", "PLAY", "SHOP"];

export default function RoleScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    // 2. Conditionally select the logo source
    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    // --- TYPEWRITER ANIMATION STATE ---
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = WORDS[currentWordIndex];
        const typingSpeed = isDeleting ? 40 : 140;

        const timeout = setTimeout(() => {
            if (!isDeleting && displayText.length < currentWord.length) {
                setDisplayText(currentWord.substring(0, displayText.length + 1));
            } else if (isDeleting && displayText.length > 0) {
                setDisplayText(currentWord.substring(0, displayText.length - 1));
            } else if (!isDeleting && displayText.length === currentWord.length) {
                setTimeout(() => setIsDeleting(true), 1800);
            } else if (isDeleting && displayText.length === 0) {
                setIsDeleting(false);
                setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, currentWordIndex]);

    const handleRoleSelection = (roleId: string) => {
        if (roleId === 'advertiser') {
            router.push('/(auth)/advertiser-auth');
        } else if (roleId === 'owner') {
            router.push('/(auth)/screenowner-auth');
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* STICKY CENTERED HEADER WITH LOGO */}
            <View style={styles.headerNav}>
                <Image
                    source={logoSource}
                    style={[
                        styles.logoImage,
                        { width: isTablet ? 150 : 120 } // Responsive sizing
                    ]}
                    resizeMode="contain"
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO SECTION */}
                <View style={styles.heroSection}>
                    <Text style={[styles.welcomeTag, { color: theme.tint }]}>
                        WELCOME TO GETSEEN
                    </Text>

                    <View style={styles.headingContainer}>
                        <Text style={[
                            styles.mainHeading,
                            {
                                fontSize: isTablet ? 32 : 36,
                                color: theme.text,
                            }
                        ]}>
                            Reach Your Customers Where They
                            <Text style={{ color: theme.tint }}> {displayText}</Text>
                            <Text style={[styles.cursor, { color: theme.tint }]}>|</Text>
                        </Text>
                    </View>

                    <Text style={[
                        styles.subText,
                        {
                            color: theme.textSecondary,
                            ...Typography.caption,
                            fontSize: isTablet ? 18 : 16
                        }
                    ]}>
                        Advertise on indoor digital billboards with just a few clicks and a flexible budget.
                    </Text>
                </View>

                {/* ROLE CARDS CONTAINER */}
                <View style={styles.cardsContainer}>
                    {ROLES.map((role) => (
                        <RoleCard
                            key={role.id}
                            item={role}
                            isTablet={isTablet}
                            onPress={() => handleRoleSelection(role.id)}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40
    },
    headerNav: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        position: 'relative',
    },
    // 3. Add logo styling
    logoImage: {
        height: 40, // Height remains consistent to match headerNav
    },
    heroSection: {
        marginBottom: 35,
        marginTop: 20
    },
    welcomeTag: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12
    },
    headingContainer: {
        minHeight: 140
    },
    mainHeading: {
        lineHeight: 46
    },
    cursor: {
        fontWeight: '200',
        marginLeft: 2,
    },
    subText: {
        lineHeight: 24,
        marginTop: 10,
        width: '95%'
    },
    cardsContainer: {
        gap: 16
    }
});
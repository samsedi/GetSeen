import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useRouter} from "expo-router";

interface AuthInputFieldProps extends TextInputProps {
    label: string;
    showForgotLink?: boolean;
    isPassword?: boolean;
    labelColor?: string;
    accentColor?: string;
    borderColor?: string;
    inputBgColor?: string;
    textColor?: string;
    containerStyle?: ViewStyle; // Allows us to use flex: 1 for side-by-side inputs
    rightIcon?: keyof typeof Ionicons.glyphMap; // For the dropdown arrow
}

export default function AuthInputField({
                                           label,
                                           showForgotLink,
                                           isPassword,
                                           labelColor = '#111',
                                           accentColor = '#D11243',
                                           borderColor = '#D1D5DB', // Standard light grey border
                                           inputBgColor = '#FFFFFF', // Clean white background
                                           textColor = '#111',
                                           containerStyle,
                                           rightIcon,
                                           ...props
                                       }: AuthInputFieldProps) {
    const [isObscured, setIsObscured] = useState(isPassword);

    const router = useRouter();
    const handleNavigationToforgotpassword = () =>{
        router.push({
            pathname: "/(auth)/forgotpassword",
        })
    }

    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <View style={styles.labelRow}>
                <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
                {showForgotLink && (
                    <TouchableOpacity onPress={handleNavigationToforgotpassword}>
                        <Text style={[styles.forgotText, { color: accentColor }]} >Forgot password?</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: inputBgColor, borderColor: borderColor, color: textColor }
                    ]}
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry={isObscured}
                    {...props}
                />

                {/* Password Eye Toggle */}
                {isPassword && (
                    <TouchableOpacity
                        style={styles.rightIconWrapper}
                        onPress={() => setIsObscured(!isObscured)}
                    >
                        <Ionicons name={isObscured ? "eye-outline" : "eye-off-outline"} size={22} color="#888" />
                    </TouchableOpacity>
                )}

                {/* Custom Right Icon (e.g., Chevron for Dropdown) */}
                {rightIcon && !isPassword && (
                    <View style={styles.rightIconWrapper}>
                        <Ionicons name={rightIcon} size={20} color="#888" />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: { gap: 8, marginBottom: 16 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 15, fontWeight: '400' }, // Clean, normal casing
    forgotText: { fontSize: 13, fontWeight: '600' },
    inputWrapper: { position: 'relative', justifyContent: 'center' },
    input: {
        height: 52, // Slightly thinner than before
        borderWidth: 1,
        borderRadius: 8, // Softer corners matching your design
        paddingHorizontal: 16,
        fontSize: 16,
    },
    rightIconWrapper: { position: 'absolute', right: 15, padding: 5 },
});
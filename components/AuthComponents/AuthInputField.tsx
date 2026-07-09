import React, { useState, ReactNode } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputFieldProps extends TextInputProps {
    label: string;
    labelColor?: string;
    borderColor?: string;
    inputBgColor?: string;
    textColor?: string;
    containerStyle?: ViewStyle;
    accentColor?: string;
    icon?: ReactNode;
    errorText?: string;

    
    // Instead of boolean flags, we use generic slot injection (Composition)
    rightLabelNode?: ReactNode;
    rightInputNode?: ReactNode;
}

export function AuthInputField({
    label,
    labelColor = '#111',
    borderColor = '#D1D5DB',
    inputBgColor = '#FFFFFF',
    textColor = '#111',
    containerStyle,
    rightLabelNode,
    rightInputNode,
    errorText,
    ...props
}: AuthInputFieldProps) {
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <View style={styles.labelRow}>
                <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
                {rightLabelNode}
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: inputBgColor, borderColor: borderColor, color: textColor }
                    ]}
                    placeholderTextColor="#A0A0A0"
                    {...props}
                />
                
                {rightInputNode && (
                    <View style={styles.rightIconWrapper}>
                        {rightInputNode}
                    </View>
                )}
            </View>
            {errorText ? (
                <Text style={styles.errorText}>{errorText}</Text>
            ) : null}
        </View>
    );
}

interface PasswordInputFieldProps extends Omit<AuthInputFieldProps, 'rightInputNode' | 'rightLabelNode'> {
    accentColor?: string;
    onForgotPress?: () => void;
}

export function PasswordInputField({
    onForgotPress,
    accentColor = '#D11243',
    ...props
}: PasswordInputFieldProps) {
    const [isObscured, setIsObscured] = useState(true);

    const forgotNode = onForgotPress ? (
        <TouchableOpacity onPress={onForgotPress}>
            <Text style={[styles.forgotText, { color: accentColor }]}>Forgot password?</Text>
        </TouchableOpacity>
    ) : undefined;

    const eyeToggleNode = (
        <TouchableOpacity onPress={() => setIsObscured(!isObscured)}>
            <Ionicons name={isObscured ? "eye-outline" : "eye-off-outline"} size={22} color="#888" />
        </TouchableOpacity>
    );

    return (
        <AuthInputField
            {...props}
            secureTextEntry={isObscured}
            rightLabelNode={forgotNode}
            rightInputNode={eyeToggleNode}
        />
    );
}

// Ensure default export is maintained so existing imports don't instantly break before we refactor screens
export default AuthInputField;

const styles = StyleSheet.create({
    inputGroup: { gap: 8, marginBottom: 16 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 15, fontWeight: '400' },
    forgotText: { fontSize: 13, fontWeight: '600' },
    inputWrapper: { position: 'relative', justifyContent: 'center' },
    input: {
        height: 52,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    rightIconWrapper: { position: 'absolute', right: 15, padding: 5 },
    errorText: { color: '#FF3B30', fontSize: 12, marginTop: -4 },
});
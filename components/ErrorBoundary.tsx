import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary — catches unhandled JS errors in the component tree
 * and shows a recovery screen instead of a white screen of death.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // In production, you'd send this to a crash reporting service like Crashlytics
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRestart = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="warning-outline" size={48} color="#FF3B30" />
                        </View>
                        <Text style={styles.title}>Something Went Wrong</Text>
                        <Text style={styles.subtitle}>
                            An unexpected error occurred. We apologize for the inconvenience.
                        </Text>
                        {__DEV__ && this.state.error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>
                                    {this.state.error.message}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.button} onPress={this.handleRestart} activeOpacity={0.8}>
                            <Ionicons name="refresh-outline" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    content: {
        alignItems: 'center',
        maxWidth: 340,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#9BA1A6',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    errorText: {
        fontSize: 13,
        color: '#FF6B6B',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF2D55',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 14,
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
    },
});

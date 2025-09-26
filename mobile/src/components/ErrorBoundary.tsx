import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Colors } from "../constants/Colors"
import { Layout } from "../constants/Layout"

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />
            }

            return (
                <View style={styles.container}>
                    <Ionicons name="warning-outline" size={64} color="#ff6b6b" />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>We're sorry, but something unexpected happened. Please try again.</Text>
                    <TouchableOpacity style={styles.button} onPress={this.resetError}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return this.props.children
    }
}

const MESSAGE_LINE_HEIGHT = Math.round(Layout.fontSize.md * 1.5)

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Layout.spacing.md + Layout.spacing.xs,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: Layout.fontSize.xxl,
        fontWeight: "700",
        color: Colors.text,
        marginTop: Layout.spacing.md,
        marginBottom: Layout.spacing.sm,
    },
    message: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: MESSAGE_LINE_HEIGHT,
        marginBottom: Layout.spacing.lg,
    },
    errorDetails: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textTertiary,
        fontFamily: "monospace",
        marginBottom: Layout.spacing.lg,
        padding: Layout.spacing.sm + Layout.spacing.xs,
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: Layout.borderRadius.md,
    },
    button: {
        backgroundColor: Colors.info,
        paddingHorizontal: Layout.spacing.xl,
        paddingVertical: Layout.spacing.sm + Layout.spacing.xs,
        borderRadius: Layout.borderRadius.md,
    },
    buttonText: {
        color: Colors.textLight,
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
    },
})
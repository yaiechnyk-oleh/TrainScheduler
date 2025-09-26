import type React from "react"
import { View, ActivityIndicator, StyleSheet, Modal, Text } from "react-native"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface LoadingOverlayProps {
    visible: boolean
    message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message = "Loading..." }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </Modal>
    )
}

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlayLight,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Layout.spacing.lg,
        alignItems: "center",
        minWidth: 120,
    },
    message: {
        marginTop: Layout.spacing.sm + Layout.spacing.xs,
        fontSize: Layout.fontSize.md,
        color: Colors.text,
        textAlign: "center",
    },
})
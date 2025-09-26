import type React from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native"
import { Button } from "./Button"
import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface AlertProps {
    visible: boolean
    title: string
    message: string
    type?: "info" | "error" | "success" | "warning"
    onClose: () => void
    actions?: Array<{
        text: string
        onPress: () => void
        style?: "default" | "cancel" | "destructive"
    }>
}

export const Alert: React.FC<AlertProps> = ({
                                                visible,
                                                title,
                                                message,
                                                type = "info",
                                                onClose,
                                                actions = [{ text: "OK", onPress: onClose }],
                                            }) => {
    const getTypeColor = () => {
        switch (type) {
            case "error":
                return Colors.error
            case "success":
                return Colors.success
            case "warning":
                return Colors.warning
            default:
                return Colors.accent
        }
    }

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.container}>
                    <View style={[styles.header, { borderTopColor: getTypeColor() }]}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                    <View style={styles.actions}>
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                title={action.text}
                                onPress={action.onPress}
                                variant={action.style === "destructive" ? "danger" : action.style === "cancel" ? "outline" : "primary"}
                                style={[styles.actionButton, index < actions.length - 1 ? styles.actionButtonMargin : undefined]}
                            />
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: Layout.spacing.lg,
    },
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        minWidth: 280,
        maxWidth: "90%",
        overflow: "hidden",
    },
    header: {
        borderTopWidth: 3,
        padding: Layout.spacing.md,
        paddingBottom: Layout.spacing.sm,
    },
    title: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
        textAlign: "center",
    },
    content: {
        paddingHorizontal: Layout.spacing.md,
        paddingBottom: Layout.spacing.md,
    },
    message: {
        fontSize: Layout.fontSize.md,
        color: Colors.text,
        textAlign: "center",
        lineHeight: 22,
    },
    actions: {
        flexDirection: "row",
        padding: Layout.spacing.md,
        paddingTop: 0,
    },
    actionButton: {
        flex: 1,
    },
    actionButtonMargin: {
        marginRight: Layout.spacing.sm,
    },
})

import type React from "react"
import { useEffect, useRef } from "react"
import { Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface ToastProps {
    visible: boolean
    message: string
    type?: "success" | "error" | "info" | "warning"
    duration?: number
    onHide: () => void
}

const { width } = Dimensions.get("window")

export const Toast: React.FC<ToastProps> = ({ visible, message, type = "info", duration = 3000, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (visible) {
            // Show toast
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideToast()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [visible, duration])

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide()
        })
    }

    const getTypeConfig = () => {
        switch (type) {
            case "success":
                return {
                    backgroundColor: "#D4EDDA",
                    borderColor: "#C3E6CB",
                    textColor: "#155724",
                    icon: "checkmark-circle" as const,
                    iconColor: "#28A745",
                }
            case "error":
                return {
                    backgroundColor: "#F8D7DA",
                    borderColor: "#F5C6CB",
                    textColor: "#721C24",
                    icon: "close-circle" as const,
                    iconColor: "#DC3545",
                }
            case "warning":
                return {
                    backgroundColor: "#FFF3CD",
                    borderColor: "#FFEAA7",
                    textColor: "#856404",
                    icon: "warning" as const,
                    iconColor: "#FFC107",
                }
            default:
                return {
                    backgroundColor: "#D1ECF1",
                    borderColor: "#BEE5EB",
                    textColor: "#0C5460",
                    icon: "information-circle" as const,
                    iconColor: "#17A2B8",
                }
        }
    }

    const config = getTypeConfig()

    if (!visible) return null

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: config.backgroundColor,
                    borderColor: config.borderColor,
                },
            ]}
        >
            <TouchableOpacity style={styles.content} onPress={hideToast} activeOpacity={0.9}>
                <Ionicons name={config.icon} size={20} color={config.iconColor} style={styles.icon} />
                <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
            </TouchableOpacity>
        </Animated.View>
    )
}

export const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: Layout.spacing.xxl + Layout.spacing.sm + Layout.spacing.xs,
        left: Layout.spacing.md,
        right: Layout.spacing.md,
        zIndex: 1000,
        borderRadius: Layout.borderRadius.md,
        borderWidth: 1,
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        padding: Layout.spacing.sm + Layout.spacing.xs,
    },
    icon: {
        marginRight: Layout.spacing.sm,
    },
    message: {
        flex: 1,
        fontSize: Layout.fontSize.sm,
        fontWeight: "600",
        color: Colors.text,
    },
})
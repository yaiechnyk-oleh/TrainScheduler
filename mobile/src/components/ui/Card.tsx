import type React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface CardProps {
    children: React.ReactNode
    style?: ViewStyle
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>
}

export const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Layout.spacing.md,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: Layout.spacing.sm + Layout.spacing.xs,
    },
})

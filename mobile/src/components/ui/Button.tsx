import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface ButtonProps {
    title: string
    onPress: () => void
    variant?: "primary" | "secondary" | "outline" | "danger"
    size?: "small" | "medium" | "large"
    disabled?: boolean
    loading?: boolean
    style?: ViewStyle
    textStyle?: TextStyle
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  variant = "primary",
                                                  size = "medium",
                                                  disabled = false,
                                                  loading = false,
                                                  style,
                                                  textStyle,
                                              }) => {
    const buttonStyle = [styles.button, styles[variant], styles[size], disabled && styles.disabled, style]

    const buttonTextStyle = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ]

    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? Colors.textLight : Colors.accent} size="small" />
            ) : (
                <Text style={buttonTextStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    )
}

export const styles = StyleSheet.create({
    button: {
        borderRadius: Layout.borderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },

    primary: {
        backgroundColor: Colors.accent,
    },
    secondary: {
        backgroundColor: Colors.surfaceSecondary,
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: Colors.accent,
    },
    danger: {
        backgroundColor: Colors.error,
    },

    small: {
        paddingHorizontal: Layout.spacing.sm + Layout.spacing.xs,
        paddingVertical: Layout.spacing.sm,
        minHeight: Layout.spacing.xl,
    },
    medium: {
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm + Layout.spacing.xs,
        minHeight: Layout.spacing.xl + Layout.spacing.sm + Layout.spacing.xs,
    },
    large: {
        paddingHorizontal: Layout.spacing.md + Layout.spacing.xs,
        paddingVertical: Layout.spacing.md,
        minHeight: Layout.spacing.xl + Layout.spacing.md + Layout.spacing.xs,
    },

    disabled: {
        opacity: 0.5,
    },

    text: {
        fontWeight: "600",
        textAlign: "center",
    },
    primaryText: {
        color: Colors.textLight,
    },
    secondaryText: {
        color: Colors.accent,
    },
    outlineText: {
        color: Colors.accent,
    },
    dangerText: {
        color: Colors.textLight,
    },

    smallText: {
        fontSize: Layout.fontSize.sm,
    },
    mediumText: {
        fontSize: Layout.fontSize.md,
    },
    largeText: {
        fontSize: Layout.fontSize.lg,
    },

    disabledText: {
        opacity: 0.7,
    },
})
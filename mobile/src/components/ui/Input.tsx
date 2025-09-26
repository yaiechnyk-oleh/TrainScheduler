import { forwardRef } from "react"
import { TextInput, View, Text, StyleSheet, type TextInputProps, type ViewStyle } from "react-native"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface InputProps extends TextInputProps {
    label?: string
    error?: string
    containerStyle?: ViewStyle
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, containerStyle, style, ...props }, ref) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                ref={ref}
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor="#8E8E93"
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    )
})

export const styles = StyleSheet.create({
    container: {
        marginBottom: Layout.spacing.md,
    },
    label: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.borderSecondary,
        borderRadius: Layout.borderRadius.md,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm + Layout.spacing.xs,
        fontSize: Layout.fontSize.md,
        backgroundColor: Colors.surface,
        minHeight: Layout.spacing.xl + Layout.spacing.sm + Layout.spacing.xs,
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.error,
        marginTop: Layout.spacing.xs,
    },
})
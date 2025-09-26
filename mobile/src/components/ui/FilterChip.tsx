import type React from "react"
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from "react-native"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface FilterChipProps {
    label: string
    selected: boolean
    onPress: () => void
    style?: ViewStyle
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.chip, selected && styles.chipSelected, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
        </TouchableOpacity>
    )
}

export const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm,
        borderRadius: 20,
        backgroundColor: Colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: Layout.spacing.sm,
        marginBottom: Layout.spacing.sm,
    },
    chipSelected: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    chipText: {
        fontSize: Layout.fontSize.sm,
        fontWeight: "600",
        color: Colors.text,
    },
    chipTextSelected: {
        color: Colors.textLight,
    },
})
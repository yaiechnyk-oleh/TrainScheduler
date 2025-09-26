import type React from "react"
import { useState } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface SearchBarProps {
    value: string
    onChangeText: (text: string) => void
    onSubmit?: () => void
    placeholder?: string
    style?: ViewStyle
}

export const SearchBar: React.FC<SearchBarProps> = ({
                                                        value,
                                                        onChangeText,
                                                        onSubmit,
                                                        placeholder = "Search...",
                                                        style,
                                                    }) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleClear = () => {
        onChangeText("")
    }

    return (
        <View style={[styles.container, isFocused && styles.containerFocused, style]}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                placeholder={placeholder}
                placeholderTextColor="#8E8E93"
                returnKeyType="search"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
            )}
        </View>
    )
}

export const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: Layout.borderRadius.lg,
        paddingHorizontal: Layout.spacing.sm + Layout.spacing.xs,
        height: Layout.spacing.xl + Layout.spacing.sm + Layout.spacing.xs,
        borderBottomWidth: 1,
        borderColor: "transparent",
    },
    containerFocused: {
        borderColor: Colors.info,
        backgroundColor: Colors.surface,
    },
    searchIcon: {
        marginRight: Layout.spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: Layout.fontSize.md,
        color: Colors.text,
    },
    clearButton: {
        marginLeft: Layout.spacing.sm,
    },
})

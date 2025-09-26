import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface PickerOption {
    label: string
    value: string
}

interface PickerProps {
    label?: string
    value?: string
    options: PickerOption[]
    onValueChange: (value: string) => void
    placeholder?: string
    error?: string
    containerStyle?: ViewStyle
}

export const Picker: React.FC<PickerProps> = ({
                                                  label,
                                                  value,
                                                  options,
                                                  onValueChange,
                                                  placeholder = "Select an option",
                                                  error,
                                                  containerStyle,
                                              }) => {
    const [isVisible, setIsVisible] = useState(false)

    const selectedOption = options.find((option) => option.value === value)

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue)
        setIsVisible(false)
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity style={[styles.picker, error && styles.pickerError]} onPress={() => setIsVisible(true)}>
                <Text style={[styles.pickerText, !selectedOption && styles.placeholderText]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8E8E93" />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => setIsVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsVisible(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label || "Select Option"}</Text>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <Ionicons name="close" size={24} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.option, item.value === value && styles.selectedOption]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={[styles.optionText, item.value === value && styles.selectedOptionText]}>
                                        {item.label}
                                    </Text>
                                    {item.value === value && <Ionicons name="checkmark" size={20} color="#007AFF" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

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
    picker: {
        borderWidth: 1,
        borderColor: Colors.borderSecondary,
        borderRadius: Layout.borderRadius.md,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm + Layout.spacing.xs,
        backgroundColor: Colors.surface,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: Layout.spacing.xl + Layout.spacing.sm + Layout.spacing.xs,
    },
    pickerError: {
        borderColor: Colors.error,
    },
    pickerText: {
        fontSize: Layout.fontSize.md,
        color: Colors.text,
        flex: 1,
    },
    placeholderText: {
        color: Colors.textSecondary,
    },
    errorText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.error,
        marginTop: Layout.spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlayLight,
        justifyContent: "center",
        alignItems: "center",
        padding: Layout.spacing.md + Layout.spacing.xs,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        width: "100%",
        maxHeight: "70%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
    },
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceSecondary,
    },
    selectedOption: {
        backgroundColor: Colors.background,
    },
    optionText: {
        fontSize: Layout.fontSize.md,
        color: Colors.text,
        flex: 1,
    },
    selectedOptionText: {
        color: Colors.info,
        fontWeight: "600",
    },
})

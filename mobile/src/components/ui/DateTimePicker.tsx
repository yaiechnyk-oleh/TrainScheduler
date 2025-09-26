"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, type ViewStyle } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface DateTimePickerProps {
    label?: string
    value: Date
    onChange: (date: Date) => void
    mode?: "date" | "time" | "datetime"
    placeholder?: string
    error?: string
    containerStyle?: ViewStyle
    minimumDate?: Date
    maximumDate?: Date
}

export const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
                                                                        label,
                                                                        value,
                                                                        onChange,
                                                                        mode = "datetime",
                                                                        placeholder,
                                                                        error,
                                                                        containerStyle,
                                                                        minimumDate,
                                                                        maximumDate,
                                                                    }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [tempDate, setTempDate] = useState(value)

    const formatDate = (date: Date) => {
        if (mode === "date") {
            return date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        } else if (mode === "time") {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else {
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}`
        }
    }

    const handleConfirm = () => {
        onChange(tempDate)
        setIsVisible(false)
    }

    const handleCancel = () => {
        setTempDate(value)
        setIsVisible(false)
    }

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setIsVisible(false)
            if (selectedDate) {
                onChange(selectedDate)
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate)
            }
        }
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={[styles.picker, error && styles.pickerError, styles.enhancedPicker]}
                onPress={() => setIsVisible(true)}
            >
                <View style={styles.pickerContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="calendar" size={20} color={Colors.accent} />
                    </View>
                    <Text style={styles.pickerText}>{formatDate(value)}</Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </View>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {Platform.OS === "ios" ? (
                <Modal visible={isVisible} transparent animationType="slide" onRequestClose={handleCancel}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                                    <Text style={styles.cancelButton}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>{label || "Select Date"}</Text>
                                <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                                    <Text style={styles.confirmButton}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.pickerContainer, styles.centerWheel]}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode={mode}
                                    display="spinner"
                                    onChange={handleDateChange}
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    textColor={Colors.text}
                                    style={styles.iosWheel}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            ) : (
                isVisible && (
                    <DateTimePicker
                        value={value}
                        mode={mode}
                        display="default"
                        onChange={handleDateChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
                )
            )}
        </View>
    )
}

const styles = StyleSheet.create({
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
        borderColor: Colors.border,
        borderRadius: Layout.borderRadius.lg,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm,
        backgroundColor: Colors.surface,
        minHeight: 44,
    },
    enhancedPicker: {
        shadowColor: Colors.text,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    pickerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
    },
    iconContainer: {
        marginRight: Layout.spacing.sm,
    },
    pickerError: {
        borderColor: Colors.error,
    },
    pickerText: {
        fontSize: Layout.fontSize.md,
        color: Colors.text,
        flex: 1,
        fontWeight: "500",
    },
    errorText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.error,
        marginTop: Layout.spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: Layout.borderRadius.xl,
        borderTopRightRadius: Layout.borderRadius.xl,
        paddingBottom: 34,
        maxHeight: "50%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surfaceSecondary,
        borderTopLeftRadius: Layout.borderRadius.xl,
        borderTopRightRadius: Layout.borderRadius.xl,
    },
    headerButton: {
        minWidth: 60,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
    },
    cancelButton: {
        fontSize: Layout.fontSize.md,
        color: Colors.accent,
    },
    confirmButton: {
        fontSize: Layout.fontSize.md,
        color: Colors.accent,
        fontWeight: "600",
    },
    pickerContainer: {
        paddingVertical: Layout.spacing.lg,
        backgroundColor: Colors.surface,
    },
    centerWheel: {
        alignItems: "center",
    },
    iosWheel: {
        height: 216,
        alignSelf: "center",
    },
})

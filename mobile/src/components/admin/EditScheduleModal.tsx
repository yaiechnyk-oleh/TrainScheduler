import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from "react-native"
import type { Schedule, UpdateScheduleRequest } from "../../types/api"
import { Button } from "../ui/Button"
import { Picker } from "../ui/Picker"
import { Input } from "../ui/Input"
import { Alert } from "../ui/Alert"
import { useScheduleStore } from "../../stores/schedule-store"
import { useScheduleMutations } from "../../hooks/queries/useSchedules"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface EditScheduleModalProps {
    visible: boolean
    schedule: Schedule | null
    onClose: () => void
}

const schema = z.object({
    status: z.enum(["ON_TIME", "DELAYED", "CANCELLED"], { required_error: "Status is required" }),
    delayMinutes: z
        .string()
        .transform((s) => (s?.trim() === "" ? "0" : s))
        .refine((s) => /^\d+$/.test(s), "Delay must be a positive number"),
})

type FormValues = z.infer<typeof schema>

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ visible, schedule, onClose }) => {
    const { selectedDate, selectedRouteId, selectedTrainType, pageSize } = useScheduleStore()
    const filtersForInvalidate = useMemo(
        () => ({ date: selectedDate, routeId: selectedRouteId, trainType: selectedTrainType, pageSize: pageSize ?? 20 }),
        [selectedDate, selectedRouteId, selectedTrainType, pageSize]
    )
    const { updateM } = useScheduleMutations(filtersForInvalidate)

    const [showAlert, setShowAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            status: (schedule?.status as any) || "ON_TIME",
            delayMinutes: schedule?.delayMinutes != null ? String(schedule.delayMinutes) : "0",
        },
    })

    useEffect(() => {
        if (schedule) {
            reset({
                status: schedule.status as any,
                delayMinutes: schedule.delayMinutes != null ? String(schedule.delayMinutes) : "0",
            })
        }
    }, [schedule, reset])

    const onSubmit = async (values: FormValues) => {
        if (!schedule) return
        try {
            const payload: UpdateScheduleRequest = {
                status: values.status as any,
                delayMinutes: parseInt(values.delayMinutes, 10),
            }
            await updateM.mutateAsync({ id: schedule.id, data: payload })
            onClose()
        } catch (e: any) {
            setErrorMsg(e?.message || "Failed to update schedule. Please try again.")
            setShowAlert(true)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleCloseAlert = () => {
        setShowAlert(false)
        setErrorMsg(null)
    }

    const statusOptions = [
        { label: "On Time", value: "ON_TIME" },
        { label: "Delayed", value: "DELAYED" },
        { label: "Cancelled", value: "CANCELLED" },
    ]

    if (!schedule) return null

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Schedule</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.scheduleInfo}>
                        <Text style={styles.routeName}>{schedule.route.name}</Text>
                        <Text style={styles.routeCode}>{schedule.route.code}</Text>
                        <Text style={styles.trainType}>{schedule.trainType.replace("_", " ")}</Text>
                    </View>

                    <Controller
                        control={control}
                        name="status"
                        render={({ field: { value, onChange} }) => (
                            <Picker
                                label="Status"
                                value={value}
                                options={statusOptions}
                                onValueChange={onChange}
                                error={errors.status?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="delayMinutes"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                label="Delay Minutes"
                                value={value}
                                onChangeText={onChange}
                                error={errors.delayMinutes?.message}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        )}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Update Schedule"
                            onPress={handleSubmit(onSubmit)}
                            loading={isSubmitting || updateM.isPending}
                        />
                    </View>
                </ScrollView>

                <Alert
                    visible={showAlert}
                    title="Update Failed"
                    message={errorMsg || "Failed to update schedule. Please try again."}
                    type="error"
                    onClose={handleCloseAlert}
                />
            </View>
        </Modal>
    )
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surfaceSecondary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm + Layout.spacing.xs,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cancelButton: {
        fontSize: Layout.fontSize.md,
        color: Colors.info,
    },
    title: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
        padding: Layout.spacing.md,
    },
    scheduleInfo: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Layout.spacing.md,
        marginBottom: Layout.spacing.lg,
    },
    routeName: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },
    routeCode: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Layout.spacing.sm,
    },
    trainType: {
        fontSize: Layout.fontSize.sm,
        color: Colors.info,
        fontWeight: "600",
    },
    buttonContainer: {
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.xl,
    },
})

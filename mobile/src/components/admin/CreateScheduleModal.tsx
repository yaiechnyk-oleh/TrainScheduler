import type React from "react"
import { useMemo, useState } from "react"
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from "react-native"
import type { Route, CreateScheduleRequest } from "../../types/api"
import { Button } from "../ui/Button"
import { Picker } from "../ui/Picker"
import { CustomDateTimePicker } from "../ui/DateTimePicker"
import { Alert } from "../ui/Alert"
import { useScheduleStore } from "../../stores/schedule-store"
import { useScheduleMutations } from "../../hooks/queries/useSchedules"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface CreateScheduleModalProps {
    visible: boolean
    onClose: () => void
    routes: Route[]
}

const schema = z.object({
    routeId: z.string().min(1, "Route is required"),
    trainType: z.enum(["INTERCITY", "REGIONAL", "NIGHT"], { required_error: "Train type is required" }),
    departAt: z.date({ required_error: "Departure time is required" }),
    arriveAt: z.date({ required_error: "Arrival time is required" }),
}).superRefine((val, ctx) => {
    if (val.arriveAt <= val.departAt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["arriveAt"], message: "Arrival must be after departure" })
    }
})

type FormValues = z.infer<typeof schema>

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({ visible, onClose, routes }) => {
    const { selectedDate, selectedRouteId, selectedTrainType, pageSize } = useScheduleStore()
    const filtersForInvalidate = useMemo(
        () => ({ date: selectedDate, routeId: selectedRouteId, trainType: selectedTrainType, pageSize: pageSize ?? 20 }),
        [selectedDate, selectedRouteId, selectedTrainType, pageSize]
    )
    const { createM } = useScheduleMutations(filtersForInvalidate)

    const [showAlert, setShowAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            routeId: "",
            trainType: "" as any,
            departAt: new Date(),
            arriveAt: new Date(Date.now() + 60 * 60 * 1000),
        },
    })

    const departAt = watch("departAt")

    const onSubmit = async (values: FormValues) => {
        try {
            const payload: CreateScheduleRequest = {
                routeId: values.routeId,
                trainType: values.trainType,
                departAt: values.departAt.toISOString(),
                arriveAt: values.arriveAt.toISOString(),
            }
            await createM.mutateAsync(payload)
            handleClose()
        } catch (e: any) {
            setErrorMsg(e?.message || "Failed to create schedule. Please try again.")
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

    const routeOptions = routes.map((route) => ({ label: route.name, value: route.id }))
    const trainTypeOptions = [
        { label: "Intercity", value: "INTERCITY" },
        { label: "Regional", value: "REGIONAL" },
        { label: "Night", value: "NIGHT" },
    ]

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Schedule</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <Controller
                        control={control}
                        name="routeId"
                        render={({ field: { value, onChange } }) => (
                            <Picker
                                label="Route"
                                value={value}
                                options={routeOptions}
                                onValueChange={onChange}
                                placeholder="Select a route"
                                error={errors.routeId?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="trainType"
                        render={({ field: { value, onChange } }) => (
                            <Picker
                                label="Train Type"
                                value={value}
                                options={trainTypeOptions}
                                onValueChange={onChange}
                                placeholder="Select train type"
                                error={errors.trainType?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="departAt"
                        render={({ field: { value, onChange } }) => (
                            <CustomDateTimePicker
                                label="Departure Time"
                                value={value}
                                onChange={onChange}
                                mode="datetime"
                                minimumDate={new Date()}
                                error={errors.departAt?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="arriveAt"
                        render={({ field: { value, onChange } }) => (
                            <CustomDateTimePicker
                                label="Arrival Time"
                                value={value}
                                onChange={onChange}
                                mode="datetime"
                                minimumDate={departAt || new Date()}
                                error={errors.arriveAt?.message}
                            />
                        )}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Create Schedule"
                            onPress={handleSubmit(onSubmit)}
                            loading={isSubmitting || createM.isPending}
                        />
                    </View>
                </ScrollView>

                <Alert
                    visible={showAlert}
                    title="Create Failed"
                    message={errorMsg || "Failed to create schedule. Please try again."}
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
    buttonContainer: {
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.xl,
    },
})


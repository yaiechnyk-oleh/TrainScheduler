import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from "react-native"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Alert } from "../ui/Alert"
import { useRouteMutations } from "../../hooks/queries/useRoutes"
import type { Route, UpdateRouteRequest } from "../../types/api"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface Props {
    visible: boolean
    route: Route | null
    onClose: () => void
}

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export const EditRouteModal: React.FC<Props> = ({ visible, route, onClose }) => {
    const { updateM } = useRouteMutations()
    const [showAlert, setShowAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: route?.name ?? "", code: route?.code ?? "" },
    })

    useEffect(() => {
        reset({ name: route?.name ?? "", code: route?.code ?? "" })
    }, [route, reset])

    const submit = async (values: FormValues) => {
        if (!route) return
        try {
            const payload: UpdateRouteRequest = { name: values.name, code: values.code || undefined }
            await updateM.mutateAsync({ id: route.id, data: payload })
            onClose()
        } catch (e: any) {
            setErrorMsg(e?.message || "Failed to update route.")
            setShowAlert(true)
        }
    }

    const handleClose = () => { reset(); onClose() }
    const closeAlert = () => { setShowAlert(false); setErrorMsg(null) }

    if (!route) return null

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                    <Text style={styles.title}>Edit Route</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
                        )}
                    />

                    <Controller
                        control={control}
                        name="code"
                        render={({ field: { value, onChange } }) => (
                            <Input label="Code" value={value ?? ""} onChangeText={onChange} error={errors.code?.message} />
                        )}
                    />

                    <View style={styles.btns}>
                        <Button title="Update Route" onPress={handleSubmit(submit)} loading={isSubmitting || updateM.isPending} />
                    </View>
                </ScrollView>

                <Alert visible={showAlert} title="Update Failed" message={errorMsg ?? "Failed to update route."} type="error" onClose={closeAlert} />
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
    cancel: {
        fontSize: Layout.fontSize.md,
        color: Colors.info,
    },
    title: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: Layout.spacing.md,
    },
    btns: {
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.xl,
    },
})

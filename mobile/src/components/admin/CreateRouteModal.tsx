import type React from "react"
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from "react-native"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Alert } from "../ui/Alert"
import { useRouteMutations } from "../../hooks/queries/useRoutes"
import { useState } from "react"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CreateRouteRequest } from "../../types/api"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface Props {
    visible: boolean
    onClose: () => void
}

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export const CreateRouteModal: React.FC<Props> = ({ visible, onClose }) => {
    const { createM } = useRouteMutations()
    const [showAlert, setShowAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", code: "" },
    })

    const submit = async (values: FormValues) => {
        try {
            const payload: CreateRouteRequest = { name: values.name, code: values.code || undefined }
            await createM.mutateAsync(payload)
            handleClose()
        } catch (e: any) {
            setErrorMsg(e?.message || "Failed to create route.")
            setShowAlert(true)
        }
    }

    const handleClose = () => { reset(); onClose() }
    const closeAlert = () => { setShowAlert(false); setErrorMsg(null) }

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
                    <Text style={styles.title}>Add Route</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="e.g. Kyiv — Lviv" />
                        )}
                    />

                    <Controller
                        control={control}
                        name="code"
                        render={({ field: { value, onChange } }) => (
                            <Input label="Code" value={value ?? ""} onChangeText={onChange} error={errors.code?.message} placeholder="Optional route code" />
                        )}
                    />

                    <View style={styles.btns}>
                        <Button title="Create Route" onPress={handleSubmit(submit)} loading={isSubmitting || createM.isPending} />
                    </View>
                </ScrollView>

                <Alert visible={showAlert} title="Create Failed" message={errorMsg ?? "Failed to create route."} type="error" onClose={closeAlert} />
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

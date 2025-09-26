import { useEffect, useState } from "react"
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { useAuthStore } from "../../src/stores/auth-store"
import { Input } from "../../src/components/ui/Input"
import { Button } from "../../src/components/ui/Button"
import { Alert } from "../../src/components/ui/Alert"
import { LoadingOverlay } from "../../src/components/ui/LoadingOverlay"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Colors } from "../../src/constants/Colors"
import { Layout } from "../../src/constants/Layout"

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/

const schema = z
    .object({
        email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .refine((v) => passwordRules.test(v), "Password must contain uppercase, lowercase, and number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type FormValues = z.infer<typeof schema>

export default function RegisterScreen() {
    const router = useRouter()
    const { register: registerUser, error, clearError, isLoading } = useAuthStore()
    const [showAlert, setShowAlert] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    })

    useEffect(() => {
        if (error) setShowAlert(true)
    }, [error])

    const onSubmit = async (values: FormValues) => {
        clearError()
        await registerUser({ email: values.email, password: values.password })
    }

    const handleCloseAlert = () => {
        setShowAlert(false)
        clearError()
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join us to manage your train schedules</Text>
                </View>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                label="Email"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                label="Password"
                                value={value}
                                onChangeText={onChange}
                                error={errors.password?.message}
                                placeholder="Create a password"
                                secureTextEntry
                                autoComplete="new-password"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                label="Confirm Password"
                                value={value}
                                onChangeText={onChange}
                                error={errors.confirmPassword?.message}
                                placeholder="Confirm your password"
                                secureTextEntry
                                autoComplete="new-password"
                            />
                        )}
                    />

                    <Button
                        title="Create Account"
                        onPress={handleSubmit(onSubmit)}
                        loading={isSubmitting}
                        style={styles.registerButton}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                        <Text style={styles.linkText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <LoadingOverlay visible={isSubmitting || isLoading} message="Creating account..." />

            <Alert
                visible={showAlert}
                title="Registration Failed"
                message={error || "Please try again with different credentials."}
                type="error"
                onClose={handleCloseAlert}
            />
        </KeyboardAvoidingView>
    )
}

const SUBTITLE_LINE_HEIGHT = Math.round(Layout.fontSize.md * 1.375)

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surfaceSecondary,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: Layout.spacing.lg,
    },

    header: {
        alignItems: "center",
        marginBottom: Layout.spacing.xl,
    },

    title: {
        fontSize: Layout.fontSize.xxxl,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },

    subtitle: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: SUBTITLE_LINE_HEIGHT,
    },

    form: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.xl,
        padding: Layout.spacing.lg,
        marginBottom: Layout.spacing.lg,
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    registerButton: {
        marginTop: Layout.spacing.sm,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    footerText: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
    },

    linkText: {
        fontSize: Layout.fontSize.md,
        color: Colors.accent,
        fontWeight: "600",
    },
})

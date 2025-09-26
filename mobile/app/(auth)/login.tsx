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

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})
type FormValues = z.infer<typeof schema>

export default function LoginScreen() {
    const router = useRouter()
    const { login, error, clearError, isLoading } = useAuthStore()
    const [showAlert, setShowAlert] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    })

    useEffect(() => {
        if (error) setShowAlert(true)
    }, [error])

    const onSubmit = async (values: FormValues) => {
        clearError()
        await login(values)
    }

    const handleCloseAlert = () => {
        setShowAlert(false)
        clearError()
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to access your train schedules</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.demoCredentials}>
                        <Text style={styles.demoTitle}>Demo Credentials:</Text>
                        <Text style={styles.demoText}>Admin: admin@example.com / Admin123!</Text>
                        <Text style={styles.demoText}>User: user@example.com / User123!</Text>
                    </View>

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
                                placeholder="Enter your password"
                                secureTextEntry
                                autoComplete="password"
                            />
                        )}
                    />

                    <Button
                        title="Sign In"
                        onPress={handleSubmit(onSubmit)}
                        loading={isSubmitting}
                        style={styles.loginButton}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                        <Text style={styles.linkText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <LoadingOverlay visible={isSubmitting || isLoading} message="Signing in..." />

            <Alert
                visible={showAlert}
                title="Sign In Failed"
                message={error || "Please check your credentials and try again."}
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

    loginButton: {
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

    demoCredentials: {
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.md,
        marginBottom: Layout.spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accent,
    },

    demoTitle: {
        fontSize: Layout.fontSize.sm,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },

    demoText: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
        fontFamily: "monospace",
    },
})

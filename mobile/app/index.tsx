import { useEffect, useState } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useAuthStore } from "../src/stores/auth-store"
import { Colors } from "../src/constants/Colors"

export default function IndexScreen() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuthStore()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        console.log(
            "[v0] Navigation check - isMounted:",
            isMounted,
            "isLoading:",
            isLoading,
            "isAuthenticated:",
            isAuthenticated,
        )

        if (isMounted && !isLoading) {
            if (isAuthenticated) {
                console.log("[v0] Navigating to tabs")
                router.replace("/(tabs)")
            } else {
                console.log("[v0] Navigating to login")
                router.replace("/(auth)/login")
            }
        }
    }, [isAuthenticated, isLoading, router, isMounted])

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
})

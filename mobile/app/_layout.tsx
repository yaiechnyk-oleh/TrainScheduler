import type React from "react"
import { ErrorBoundary } from "../src/components/ErrorBoundary"
import { useEffect } from "react"
import { Slot } from "expo-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StatusBar } from "expo-status-bar"
import { useAuthStore } from "../src/stores/auth-store"
import { useWebSocket } from "../src/hooks/useWebSocket"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {GlobalSocketListeners} from "../src/realtime/GlobalSocketListeners";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000,
        },
    },
})

function WebSocketProvider({ children }: { children: React.ReactNode }) {
    useWebSocket()
    return <>{children}</>
}

export default function RootLayout() {
    const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth)

    useEffect(() => {
        loadStoredAuth()
    }, [loadStoredAuth])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <GlobalSocketListeners />
                        <Slot />
                        <StatusBar style="light" />
                </QueryClientProvider>
            </ErrorBoundary>
        </GestureHandlerRootView>
    )
}

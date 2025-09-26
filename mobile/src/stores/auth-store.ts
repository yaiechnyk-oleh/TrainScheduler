import { create } from "zustand"
import type { User, AuthTokens, LoginRequest, RegisterRequest } from "../types/api"
import { apiClient } from "../services/api"
import { API_ENDPOINTS } from "../config/api"
import {
    storeAuthTokens,
    removeAuthTokens,
    storeUser,
    getStoredUser,
    getAuthToken,
    getRefreshToken,
} from "../services/auth-storage"
import { router } from "expo-router"

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    login: (credentials: LoginRequest) => Promise<void>
    register: (credentials: RegisterRequest) => Promise<void>
    logout: () => Promise<void>
    loadStoredAuth: () => Promise<void>
    clearError: () => void
}

function decodeJwt<T = any>(token: string): T | null {
    try {
        const [, payload] = token.split(".")
        if (!payload) return null
        const base = payload.replace(/-/g, "+").replace(/_/g, "/")
        const pad = base.length % 4 ? "=".repeat(4 - (base.length % 4)) : ""
        const str = globalThis.atob ? globalThis.atob(base + pad) : Buffer.from(base + pad, "base64").toString("utf-8")
        return JSON.parse(str) as T
    } catch {
        return null
    }
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
            const response = await apiClient.post<AuthTokens>(API_ENDPOINTS.LOGIN, credentials)
            if (!response.access_token || !response.refresh_token) {
                throw new Error("Invalid response: missing tokens")
            }

            await storeAuthTokens(response.access_token, response.refresh_token)

            // Decode user from JWT (fallbacks preserved)
            const payload = decodeJwt<any>(response.access_token) || {}
            const user: User = {
                id: payload.sub,
                email: payload.email || credentials.email,
                role: payload.role,
            }

            await storeUser(user)
            set({ user, isAuthenticated: true, isLoading: false })

            setTimeout(() => {
                try {
                    router.replace("/(tabs)")
                } catch (navError) {
                    console.log("[auth] Navigation error:", navError)
                }
            }, 60)
        } catch (error: any) {
            set({
                error: error?.message || "Login failed. Please check your connection and try again.",
                isLoading: false,
                isAuthenticated: false,
            })
        }
    },

    register: async (credentials: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
            const response = await apiClient.post<AuthTokens>(API_ENDPOINTS.REGISTER, credentials)
            if (!response.access_token || !response.refresh_token) {
                throw new Error("Invalid response: missing tokens")
            }

            await storeAuthTokens(response.access_token, response.refresh_token)

            const payload = decodeJwt<any>(response.access_token) || {}
            const user: User = {
                id: payload.sub,
                email: payload.email || credentials.email,
                role: payload.role,
            }

            await storeUser(user)
            set({ user, isAuthenticated: true, isLoading: false })

            setTimeout(() => {
                try {
                    router.replace("/(tabs)")
                } catch (navError) {
                    console.log("[auth] Registration navigation error:", navError)
                }
            }, 60)
        } catch (error: any) {
            set({
                error: error?.message || "Registration failed",
                isLoading: false,
            })
            throw error
        }
    },

    logout: async () => {
        set({ isLoading: true })
        try {
            const refreshToken = await getRefreshToken()
            if (refreshToken) {
                await apiClient.post(API_ENDPOINTS.LOGOUT, { refreshToken })
            } else {
                await apiClient.post(API_ENDPOINTS.LOGOUT)
            }
        } catch (error) {
            console.warn("[auth] Logout API call failed:", error)
        }

        await removeAuthTokens()
        set({ user: null, isAuthenticated: false, isLoading: false, error: null })

        setTimeout(() => {
            try {
                router.replace("/login")
            } catch (navError) {
                try {
                    router.push("/login")
                } catch (fallbackError) {
                    console.log("[auth] Fallback navigation failed:", fallbackError)
                }
            }
        }, 60)
    },

    loadStoredAuth: async () => {
        set({ isLoading: true })
        try {
            const [user, token] = await Promise.all([getStoredUser(), getAuthToken()])
            if (user && token) {
                set({ user, isAuthenticated: true })
            }
        } catch (error) {
            console.warn("[auth] Failed to load stored auth:", error)
            await removeAuthTokens()
        }
        set({ isLoading: false })
    },

    clearError: () => set({ error: null }),
}))

import * as SecureStore from "expo-secure-store"
import type { User } from "../types/api"

const BASE_URL =
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3000"

const ACCESS_KEY = "access_token"
const REFRESH_KEY = "refresh_token"
const USER_KEY   = "auth_user"

let refreshingPromise: Promise<string | null> | null = null

export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY)
}
export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY)
}
export async function setAccessToken(token: string | null): Promise<void> {
    if (token) await SecureStore.setItemAsync(ACCESS_KEY, token)
    else await SecureStore.deleteItemAsync(ACCESS_KEY)
}
export async function setRefreshToken(token: string | null): Promise<void> {
    if (token) await SecureStore.setItemAsync(REFRESH_KEY, token)
    else await SecureStore.deleteItemAsync(REFRESH_KEY)
}
export async function clearAuthTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_KEY)
    await SecureStore.deleteItemAsync(REFRESH_KEY)
}

export async function storeUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}
export async function getStoredUser(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as User
    } catch {
        return null
    }
}
export async function clearStoredUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY)
}

export async function storeAuthTokens(access: string, refresh: string): Promise<void> {
    await setAccessToken(access)
    await setRefreshToken(refresh)
}
export async function removeAuthTokens(): Promise<void> {
    await clearAuthTokens()
    await clearStoredUser()
}
export async function getAuthToken(): Promise<string | null> {
    return getAccessToken()
}

export async function refreshAccessToken(refreshEndpoint: string): Promise<string | null> {
    if (!refreshingPromise) {
        refreshingPromise = (async () => {
            const refreshToken = await getRefreshToken()
            if (!refreshToken) return null

            const url = `${BASE_URL}${refreshEndpoint.startsWith("/") ? refreshEndpoint : `/${refreshEndpoint}`}`
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            })

            if (!res.ok) {
                await setAccessToken(null)
                return null
            }

            const data = (await res.json()) as { access_token?: string; refresh_token?: string }
            if (data?.access_token) await setAccessToken(data.access_token)
            if (data?.refresh_token) await setRefreshToken(data.refresh_token)
            return data?.access_token ?? null
        })().finally(() => {
            refreshingPromise = null
        })
    }
    return refreshingPromise
}

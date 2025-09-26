import { Platform } from "react-native"
import { API_ENDPOINTS } from "../config/api"
import {
    getAccessToken,
    refreshAccessToken,
} from "./auth-storage"

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"
type QueryParams = Record<string, string | number | boolean | undefined | null>

const BASE_URL =
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3000"

function buildUrl(path: string, params?: QueryParams) {
    const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
    if (!params) return url
    const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    return qs ? `${url}?${qs}` : url
}

async function toApiError(res: Response) {
    let message = `HTTP ${res.status}`
    try {
        const data = await res.json()
        const m = Array.isArray(data?.message) ? data.message[0] : data?.message
        message = m || message
    } catch {}
    const err = new Error(message) as Error & { status?: number }
    err.status = res.status
    return err
}

async function doFetch(url: string, method: HttpMethod, body?: any, token?: string | null, signal?: AbortSignal) {
    return fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "x-device": Platform.OS,
        },
        body: body != null ? JSON.stringify(body) : undefined,
        signal,
    })
}

async function request<T>(
    path: string,
    { method, params, body, signal }: { method: HttpMethod; params?: QueryParams; body?: any; signal?: AbortSignal }
): Promise<T> {
    const url = buildUrl(path, params)
    let token = await getAccessToken()

    let res = await doFetch(url, method, body, token, signal)

    if (res.status === 401) {
        token = await refreshAccessToken(API_ENDPOINTS.REFRESH ?? "/auth/refresh")
        if (token) {
            res = await doFetch(url, method, body, token, signal)
        }
    }

    if (!res.ok) throw await toApiError(res)
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
}

export const apiClient = {
    request<T>(path: string, method: HttpMethod, params?: QueryParams, body?: any, signal?: AbortSignal) {
        return request<T>(path, { method, params, body, signal })
    },
    get<T>(path: string, params?: QueryParams, signal?: AbortSignal) {
        return request<T>(path, { method: "GET", params, signal })
    },
    post<T>(path: string, body?: any, signal?: AbortSignal) {
        return request<T>(path, { method: "POST", body, signal })
    },
    patch<T>(path: string, body?: any, signal?: AbortSignal) {
        return request<T>(path, { method: "PATCH", body, signal })
    },
    delete<T>(path: string, params?: QueryParams, signal?: AbortSignal) {
        return request<T>(path, { method: "DELETE", params, signal })
    },
}

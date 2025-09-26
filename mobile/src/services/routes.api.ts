import { apiClient } from "./api"
import { API_ENDPOINTS } from "../config/api"
import type { Route } from "../types/api"

export type CreateRouteRequest = { name: string; code?: string }
export type UpdateRouteRequest = Partial<CreateRouteRequest>

export type RouteStopsPayload = {
    stops: Array<{
        stopId: string
        order: number
        minutesFromStart?: number
    }>
}

export async function getRoutes(): Promise<Route[]> {
    return apiClient.get(API_ENDPOINTS.ROUTES)
}

export async function getRouteById(id: string): Promise<Route> {
    return apiClient.get(`${API_ENDPOINTS.ROUTES}/${id}`)
}

export async function createRoute(payload: CreateRouteRequest): Promise<Route> {
    return apiClient.post(API_ENDPOINTS.ROUTES, payload)
}

export async function updateRoute(id: string, payload: UpdateRouteRequest): Promise<Route> {
    return apiClient.patch(`${API_ENDPOINTS.ROUTES}/${id}`, payload)
}

export async function deleteRoute(id: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.ROUTES}/${id}`)
}

export async function setRouteStops(routeId: string, payload: RouteStopsPayload): Promise<Route> {
    return apiClient.post(`${API_ENDPOINTS.ROUTES}/${routeId}/stops`, payload)
}

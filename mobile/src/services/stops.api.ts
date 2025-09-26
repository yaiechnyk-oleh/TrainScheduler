import { apiClient } from "./api"
import { API_ENDPOINTS } from "../config/api"
import type { Stop } from "../types/api"

export type CreateStopRequest = { name: string; city?: string; code?: string }
export type UpdateStopRequest = Partial<CreateStopRequest>

export async function getStops(): Promise<Stop[]> {
    return apiClient.get(API_ENDPOINTS.STOPS)
}
export async function createStop(payload: CreateStopRequest): Promise<Stop> {
    return apiClient.post(API_ENDPOINTS.STOPS, payload)
}
export async function updateStop(id: string, payload: UpdateStopRequest): Promise<Stop> {
    return apiClient.patch(`${API_ENDPOINTS.STOPS}/${id}`, payload)
}
export async function deleteStop(id: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.STOPS}/${id}`)
}

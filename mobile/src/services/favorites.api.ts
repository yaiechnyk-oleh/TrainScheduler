import { apiClient } from "./api"
import { API_ENDPOINTS } from "../config/api"
import type { Favorite } from "../types/api"

export async function getFavorites(): Promise<Favorite[]> {
    return apiClient.get(API_ENDPOINTS.FAVORITES)
}

export async function addFavorite(routeId: string) {
    return apiClient.post(API_ENDPOINTS.FAVORITES, { routeId }) // 👈 body {routeId}
}

export async function removeFavorite(routeId: string) {
    return apiClient.delete(`${API_ENDPOINTS.FAVORITES}/${routeId}`)
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    getRoutes, getRouteById,
    createRoute, updateRoute, deleteRoute,
    setRouteStops,
    type CreateRouteRequest, type UpdateRouteRequest, type RouteStopsPayload,
} from "../../services/routes.api"
import type { Route } from "../../types/api"

export const routesKey = ["routes"] as const
export const routeKey = (id: string) => ["routes", id] as const

export function useRoutes() {
    return useQuery({ queryKey: routesKey, queryFn: getRoutes })
}

export function useRoute(id: string | null) {
    return useQuery({
        enabled: !!id,
        queryKey: routeKey(id || ""),
        queryFn: () => getRouteById(id as string),
    })
}

export function useRouteMutations() {
    const qc = useQueryClient()

    const createM = useMutation({
        mutationFn: (payload: CreateRouteRequest) => createRoute(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: routesKey }),
    })

    const updateM = useMutation({
        mutationFn: (p: { id: string; data: UpdateRouteRequest }) => updateRoute(p.id, p.data),
        onSuccess: (route) => {
            qc.invalidateQueries({ queryKey: routesKey })
            qc.invalidateQueries({ queryKey: routeKey(route.id) })
        },
    })

    const deleteM = useMutation({
        mutationFn: (id: string) => deleteRoute(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: routesKey }),
    })

    const setStopsM = useMutation({
        mutationFn: (p: { routeId: string; data: RouteStopsPayload }) => setRouteStops(p.routeId, p.data),
        onSuccess: (route) => {
            qc.invalidateQueries({ queryKey: routesKey })
            qc.invalidateQueries({ queryKey: routeKey(route.id) })
        },
    })

    return { createM, updateM, deleteM, setStopsM }
}

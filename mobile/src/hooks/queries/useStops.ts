import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    getStops,
    createStop,
    updateStop,
    deleteStop,
    type CreateStopRequest,
    type UpdateStopRequest,
} from "../../services/stops.api"
import type { Stop } from "../../types/api"

export const stopsKey = ["stops"] as const
export const stopKey = (id: string) => ["stops", id] as const

export function useStops(enabled: boolean = true) {
    return useQuery<Stop[]>({
        queryKey: stopsKey,
        queryFn: getStops,          // ✅ required to avoid “No queryFn” error
        enabled,
        staleTime: 60_000,
    })
}

export function useStopMutations() {
    const qc = useQueryClient()

    const createM = useMutation({
        mutationFn: (payload: CreateStopRequest) => createStop(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: stopsKey })
        },
    })

    const updateM = useMutation({
        mutationFn: (p: { id: string; data: UpdateStopRequest }) => updateStop(p.id, p.data),
        onSuccess: (stop) => {
            qc.invalidateQueries({ queryKey: stopsKey })
            qc.invalidateQueries({ queryKey: stopKey(stop.id) })
        },
    })

    const deleteM = useMutation({
        mutationFn: (id: string) => deleteStop(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: stopsKey })
        },
    })

    return { createM, updateM, deleteM }
}

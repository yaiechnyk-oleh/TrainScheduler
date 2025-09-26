import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} from "../../services/schedules.api"
import type { Schedule } from "../../types/api"

export const schedulesKey = (f: {
    date?: string | null
    routeId?: string | null
    trainType?: string | null
    pageSize?: number | null
}) =>
    [
        "schedules",
        f?.date ?? "any",
        f?.routeId ?? "any",
        f?.trainType ?? "any",
        f?.pageSize ?? "ps",
    ] as const

export const scheduleKey = (id: string) => ["schedule", id] as const

const isSchedulesKey = (key: unknown) => Array.isArray(key) && key[0] === "schedules"

/** Paged list (infinite) */
export function useInfiniteSchedules(filters: {
    date?: string | null
    routeId?: string | null
    trainType?: string | null
    pageSize?: number | null
}) {
    return useInfiniteQuery({
        queryKey: schedulesKey(filters),
        queryFn: ({ pageParam = 1 }) =>
            getSchedules({ ...filters, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (last: any) => {
            if (last?.nextPage) return last.nextPage
            if (typeof last?.page === "number" && typeof last?.pageSize === "number" && typeof last?.total === "number") {
                const loaded = last.page * last.pageSize
                return loaded < last.total ? last.page + 1 : undefined
            }
            return undefined
        },
        select: (data) => ({
            ...data,
            items: data.pages.flatMap((p: any) => p?.items ?? p?.data ?? [] as Schedule[]),
        }),
        staleTime: 0,
    })
}

export function useSchedule(id?: string) {
    return {
        enabled: !!id,
        queryKey: scheduleKey(id as string),
        queryFn: () => getScheduleById(id as string),
    }
}

export function useScheduleMutations() {
    const qc = useQueryClient()

    const invalidateAllSchedules = () =>
        qc.invalidateQueries({ predicate: (q) => isSchedulesKey(q.queryKey) })

    const createM = useMutation({
        mutationFn: createSchedule,
        onSuccess: () => {
            invalidateAllSchedules()
        },
    })

    const updateM = useMutation({
        mutationFn: (p: { id: string; data: Partial<Schedule> }) => updateSchedule(p.id, p.data),
        onSuccess: (_res, vars) => {
            invalidateAllSchedules()
            qc.invalidateQueries({ queryKey: scheduleKey(vars.id) })
        },
    })

    const deleteM = useMutation({
        mutationFn: (id: string) => deleteSchedule(id),
        onSuccess: (_res, id) => {
            invalidateAllSchedules()
            qc.invalidateQueries({ queryKey: scheduleKey(id) })
        },
    })

    return { createM, updateM, deleteM }
}

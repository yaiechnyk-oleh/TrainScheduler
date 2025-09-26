import { create } from "zustand"

export type TrainType = "INTERCITY" | "REGIONAL" | "NIGHT"

export type FilterPatch = Partial<{
    date: string
    routeId?: string
    trainType?: TrainType
    search: string
    pageSize: number
}>

type ScheduleFiltersState = {
    selectedDate: string
    selectedRouteId?: string
    selectedTrainType?: TrainType
    search?: string
    pageSize: number

    setDate: (date: string) => void
    setRouteId: (routeId?: string) => void
    setTrainType: (type?: TrainType) => void
    setSearch: (q?: string) => void
    setPageSize: (n: number) => void

    setFilters: (patch: FilterPatch) => void
}

export const useScheduleStore = create<ScheduleFiltersState>((set) => ({
    selectedDate: new Date().toISOString().slice(0, 10),
    selectedRouteId: undefined,
    selectedTrainType: undefined,
    search: "",
    pageSize: 20,

    setDate: (selectedDate) => set({ selectedDate }),
    setRouteId: (selectedRouteId) => set({ selectedRouteId }),
    setTrainType: (selectedTrainType) => set({ selectedTrainType }),
    setSearch: (search) => set({ search }),
    setPageSize: (pageSize) => set({ pageSize }),

    setFilters: (patch) =>
        set((state) => {
            const next: Partial<ScheduleFiltersState> = {}

            if ("date" in patch && patch.date !== undefined) {
                next.selectedDate = patch.date
            }
            if ("routeId" in patch) {
                next.selectedRouteId = patch.routeId
            }
            if ("trainType" in patch) {
                next.selectedTrainType = patch.trainType
            }
            if ("search" in patch && patch.search !== undefined) {
                next.search = patch.search
            }
            if ("pageSize" in patch && patch.pageSize !== undefined) {
                next.pageSize = patch.pageSize
            }

            return { ...state, ...next }
        }),
}))

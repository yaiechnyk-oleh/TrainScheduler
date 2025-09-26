// src/services/schedules.api.ts
import { apiClient } from "./api"
import { API_ENDPOINTS } from "../config/api"
import type {
    PaginatedSchedules,
    QuerySchedulesParams,
    CreateScheduleRequest,
    UpdateScheduleRequest,
    Schedule,
} from "../types/api"

export async function getSchedules(params: QuerySchedulesParams): Promise<PaginatedSchedules> {
    const page = Math.max(1, Number(params.page ?? 1))
    const pageSize = Math.max(1, Number(params.pageSize ?? 20))
    return apiClient.get<PaginatedSchedules>(API_ENDPOINTS.SCHEDULES ?? "/schedules", {
        ...params,
        page,
        pageSize,
    })
}

export function createSchedule(data: CreateScheduleRequest) {
    return apiClient.post<Schedule>(API_ENDPOINTS.SCHEDULES ?? "/schedules", data)
}
export function updateSchedule(id: string, data: UpdateScheduleRequest) {
    return apiClient.patch<Schedule>(`${API_ENDPOINTS.SCHEDULES ?? "/schedules"}/${id}`, data)
}
export function deleteSchedule(id: string) {
    return apiClient.delete<void>(`${API_ENDPOINTS.SCHEDULES ?? "/schedules"}/${id}`)
}
export function getScheduleById(id: string) {
    return apiClient.get<Schedule>(`${API_ENDPOINTS.SCHEDULES ?? "/schedules"}/${id}`)
}
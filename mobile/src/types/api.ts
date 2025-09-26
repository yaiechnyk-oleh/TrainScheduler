export interface User {
    id: string
    email: string
    role: "USER" | "ADMIN"
}

export interface AuthTokens {
    access_token: string
    refresh_token: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
}

export interface Stop {
    id: string
    name: string
    city?: string
    lat?: number
    lng?: number
}

export interface RouteStop {
    order: number
    stop: Stop
    minutesFromStart?: number
}

export interface Route {
    id: string
    name: string
    code?: string
    stops: RouteStop[]
}

export interface Schedule {
    id: string
    routeId: string
    trainType: "INTERCITY" | "REGIONAL" | "NIGHT"
    departAt: string
    arriveAt: string
    status: "ON_TIME" | "DELAYED" | "CANCELLED"
    delayMinutes: number
    route: Route
}

export interface PaginatedSchedules {
    items: Schedule[]
    total: number
    page: number
    pageSize: number
}

export interface Favorite {
    route: Route
}

export interface CreateScheduleRequest {
    routeId: string
    trainType: "INTERCITY" | "REGIONAL" | "NIGHT"
    departAt: string
    arriveAt: string
}

export interface UpdateScheduleRequest {
    status?: "ON_TIME" | "DELAYED" | "CANCELLED"
    delayMinutes?: number
}

export interface QuerySchedulesParams {
    date: string
    routeId?: string
    trainType?: "INTERCITY" | "REGIONAL" | "NIGHT"
    page?: number
    pageSize?: number
}

export interface CreateRouteRequest  {
    name: string
    code?: string
}
export type UpdateRouteRequest = Partial<CreateRouteRequest>

export interface CreateStopRequest  {
    name: string
    city?: string
    code?: string
}
export type UpdateStopRequest = Partial<CreateStopRequest>

export interface AddRouteStopRequest  {
    stopId: string
    minutesFromStart: number
    order: number
}
export type UpdateRouteStopRequest = Partial<AddRouteStopRequest>

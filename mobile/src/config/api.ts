export const API_BASE_URL = "http://localhost:3000"

export const API_ENDPOINTS = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",

    SCHEDULES: "/schedules",

    ROUTES: "/routes",

    FAVORITES: "/favorites",

    STOPS: "/stops",
} as const

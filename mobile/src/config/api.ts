export const API_BASE_URL = "trainscheduler-production.up.railway.app"

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

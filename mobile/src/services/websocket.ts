import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "./auth-storage";

export type WsPayload =
    | { type: "CREATED" | "UPDATED" | "DELETED"; scheduleId?: string; routeId?: string; stopId?: string }
    | Record<string, any>;

class WebSocketService {
    private socket: Socket | null = null;

    async connect(): Promise<void> {
        if (this.socket?.connected) return;
        const token = await getAuthToken().catch(() => undefined);

        this.socket = io(API_BASE_URL, {
            auth: token ? { token } : undefined,
            transports: ["websocket"],
            timeout: 10000,
        });

        this.socket.on("connect_error", () => {/* optional logging */});
    }

    onScheduleChanged(cb: (p: WsPayload) => void) { this.socket?.on("schedule.changed", cb); }
    offScheduleChanged(cb?: (p: WsPayload) => void) { this.socket?.off("schedule.changed", cb); }

    onRouteChanged(cb: (p: WsPayload) => void) { this.socket?.on("route.changed", cb); }
    offRouteChanged(cb?: (p: WsPayload) => void) { this.socket?.off("route.changed", cb); }

    onStopChanged(cb: (p: WsPayload) => void) { this.socket?.on("stop.changed", cb); }
    offStopChanged(cb?: (p: WsPayload) => void) { this.socket?.off("stop.changed", cb); }

    disconnect() { this.socket?.disconnect(); this.socket = null; }
    isConnected() { return this.socket?.connected || false; }
}

export const webSocketService = new WebSocketService();

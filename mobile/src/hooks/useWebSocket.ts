import { useEffect, useRef } from "react";
import { webSocketService } from "../services/websocket";
import { useAuthStore } from "../stores/auth-store";

export const useWebSocket = () => {
    const { isAuthenticated } = useAuthStore();
    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (isAuthenticated && !isConnectedRef.current) {
            webSocketService.connect();
            isConnectedRef.current = true;
        }
        if (!isAuthenticated && isConnectedRef.current) {
            webSocketService.disconnect();
            isConnectedRef.current = false;
        }
        return () => {
            if (isConnectedRef.current) {
                webSocketService.disconnect();
                isConnectedRef.current = false;
            }
        };
    }, [isAuthenticated]);

    return {
        isConnected: webSocketService.isConnected(),
        onScheduleChanged: webSocketService.onScheduleChanged.bind(webSocketService),
        offScheduleChanged: webSocketService.offScheduleChanged.bind(webSocketService),
        onRouteChanged: webSocketService.onRouteChanged.bind(webSocketService),
        offRouteChanged: webSocketService.offRouteChanged.bind(webSocketService),
        onStopChanged: webSocketService.onStopChanged.bind(webSocketService),
        offStopChanged: webSocketService.offStopChanged.bind(webSocketService),
    };
};

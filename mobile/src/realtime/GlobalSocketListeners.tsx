import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "../hooks/useWebSocket";
import type { WsPayload } from "../services/websocket";

export function GlobalSocketListeners() {
    const qc = useQueryClient();
    const { onScheduleChanged, offScheduleChanged, onRouteChanged, offRouteChanged, onStopChanged, offStopChanged } =
        useWebSocket();

    useEffect(() => {
        const onSchedule = (p: WsPayload) => {
            qc.invalidateQueries({ queryKey: ["schedules"] });
            const id = (p as any)?.scheduleId ?? (p as any)?.id;
            if (id) qc.invalidateQueries({ queryKey: ["schedule", id] });
        };

        const onRoute = (p: WsPayload) => {
            qc.invalidateQueries({ queryKey: ["routes"] });
            qc.invalidateQueries({ queryKey: ["schedules"] });
            const id = (p as any)?.routeId ?? (p as any)?.id;
            if (id) qc.invalidateQueries({ queryKey: ["route", id] });
        };

        const onStop = () => {
            qc.invalidateQueries({ queryKey: ["stops"] });
            qc.invalidateQueries({ queryKey: ["routes"] });
            qc.invalidateQueries({ queryKey: ["schedules"] });
        };

        onScheduleChanged(onSchedule);
        onRouteChanged(onRoute);
        onStopChanged(onStop);
        return () => {
            offScheduleChanged(onSchedule);
            offRouteChanged(onRoute);
            offStopChanged(onStop);
        };
    }, [qc, onScheduleChanged, offScheduleChanged, onRouteChanged, offRouteChanged, onStopChanged, offStopChanged]);

    return null;
}

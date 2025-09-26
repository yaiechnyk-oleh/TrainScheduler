import { useEffect, useMemo, useState } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useScheduleStore } from "../../src/stores/schedule-store"
import { useWebSocket } from "../../src/hooks/useWebSocket"
import { Toast } from "../../src/components/ui/Toast"
import { ConnectionStatus } from "../../src/components/ui/ConnectionStatus"
import { SearchBar } from "../../src/components/ui/SearchBar"
import { ScheduleFilters } from "../../src/components/schedule/ScheduleFilters"
import { ScheduleList } from "../../src/components/schedule/ScheduleList"
import { Colors } from "../../src/constants/Colors"
import { Layout } from "../../src/constants/Layout"
import type { Schedule } from "../../src/types/api"

import { useInfiniteSchedules, schedulesKey } from "../../src/hooks/queries/useSchedules"
import { useRoutes } from "../../src/hooks/queries/useRoutes"
import { useQueryClient } from "@tanstack/react-query"

const normalize = (s: string = "") =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()

const scheduleHaystack = (s: Schedule) => {
    const routeName = s.route?.name ?? ""
    const code = s.route?.code ?? ""
    const train = s.trainType?.replace("_", " ") ?? ""
    const stopsText = (s.route?.stops ?? [])
        .map(rs => `${rs.stop?.name ?? ""} ${rs.stop?.city ?? ""}`)
        .join(" ")
    return normalize(`${routeName} ${code} ${train} ${stopsText}`)
}

export default function SchedulesScreen() {
    const router = useRouter()

    const { selectedDate, selectedRouteId, selectedTrainType, setFilters, pageSize } = useScheduleStore()

    const filters = useMemo(
        () => ({
            date: selectedDate,
            routeId: selectedRouteId,
            trainType: selectedTrainType,
            pageSize: pageSize ?? 20,
        }),
        [selectedDate, selectedRouteId, selectedTrainType, pageSize]
    )

    const { data: routes = [] } = useRoutes()

    const {
        data,
        isLoading,
        isRefetching,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteSchedules(filters)

    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [toast, setToast] = useState<{
        visible: boolean
        message: string
        type: "success" | "error" | "info" | "warning"
    }>({ visible: false, message: "", type: "info" })

    const { isConnected, onScheduleChanged, offScheduleChanged } = useWebSocket()

    const queryClient = useQueryClient()
    const listKey = schedulesKey(filters as any)

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(normalize(searchQuery)), 250)
        return () => clearTimeout(id)
    }, [searchQuery])

    const handleRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
    }

    const handleSchedulePress = (schedule: Schedule) => {
        router.push({ pathname: "/schedule/[id]", params: { id: schedule.id } })
    }

    const handleSearch = () => {
        setDebouncedQuery(normalize(searchQuery))
    }

    const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") =>
        setToast({ visible: true, message, type })
    const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

    const allItems = data?.items ?? []

    const filteredSchedules = useMemo(() => {
        if (!debouncedQuery) return allItems
        const tokens = debouncedQuery.split(/\s+/).filter(Boolean)
        if (tokens.length === 0) return allItems
        return allItems.filter((s) => {
            const hay = scheduleHaystack(s)
            return tokens.every((t) => hay.includes(t))
        })
    }, [allItems, debouncedQuery])

    useEffect(() => {
        const invalidate = () => queryClient.invalidateQueries({ queryKey: listKey })

        const handler = (payload: any) => {
            const t = payload?.type as "CREATED" | "UPDATED" | "DELETED" | undefined
            invalidate()
            if (t === "CREATED") showToast("New schedule added", "success")
            else if (t === "UPDATED") showToast("Schedule updated", "info")
            else if (t === "DELETED") showToast("Schedule removed", "warning")
            else showToast("Schedule changed", "info")
        }

        onScheduleChanged(handler)
        return () => offScheduleChanged(handler)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryClient, JSON.stringify(listKey)])

    const hasMore = !!hasNextPage

    return (
        <View style={styles.container}>
            <ConnectionStatus isConnected={isConnected} style={styles.connectionStatus} />

            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmit={handleSearch}
                    placeholder="Search routes..."
                    style={styles.searchBar}
                />
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                    <Ionicons name={showFilters ? "options" : "options-outline"} size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <ScheduleFilters
                    selectedDate={new Date(selectedDate)}
                    onDateChange={(date) => setFilters({ date: date.toISOString().split("T")[0] })}
                    selectedTrainType={selectedTrainType}
                    onTrainTypeChange={(type) => setFilters({ trainType: type })}
                    selectedRoute={selectedRouteId}
                    onRouteChange={(routeId) => setFilters({ routeId })}
                    routes={routes}
                />
            )}

            <ScheduleList
                schedules={filteredSchedules}
                loading={isLoading}
                refreshing={refreshing || isRefetching}
                onRefresh={handleRefresh}
                onSchedulePress={handleSchedulePress}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
            />

            <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
            flex: 1,
            backgroundColor: Colors.background
    },
    connectionStatus: {
            marginHorizontal: Layout.spacing.md,
            marginTop: Layout.spacing.sm
        },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    searchBar: {
        flex: 1,
        marginRight: Layout.spacing.sm
    },
    filterButton: {
        padding: Layout.spacing.sm
    },
})

import { useMemo, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Card } from "../../src/components/ui/Card"
import { Button } from "../../src/components/ui/Button"
import { Alert } from "../../src/components/ui/Alert"
import type { Schedule } from "../../src/types/api"

import { useQuery, useQueryClient, InfiniteData } from "@tanstack/react-query"
import { getScheduleById } from "../../src/services/schedules.api"
import { useFavorites, useFavoritesMutations } from "../../src/hooks/queries/useFavorites"

import { Colors } from "../../src/constants/Colors"
import { Layout } from "../../src/constants/Layout"

const SCHEDULES_LIST_KEY_PREFIX = ["schedules"] as const

const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

const formatDuration = (departAt: string, arriveAt: string) => {
    const depart = new Date(departAt)
    const arrive = new Date(arriveAt)
    const durationMs = arrive.getTime() - depart.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "ON_TIME":
            return "#34C759"
        case "DELAYED":
            return "#FF9500"
        case "CANCELLED":
            return "#FF3B30"
        default:
            return "#8E8E93"
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case "ON_TIME":
            return "On Time"
        case "DELAYED":
            return "Delayed"
        case "CANCELLED":
            return "Cancelled"
        default:
            return status
    }
}

export default function ScheduleDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const scheduleId = Array.isArray(id) ? id[0] : id
    const router = useRouter()
    const qc = useQueryClient()

    const onBack = () => {
        // @ts-ignore: expo-router may provide canGoBack()
        if (router.canGoBack?.()) router.back()
        else router.replace("/(tabs)")
    }

    const initialFromCache = useMemo<Schedule | undefined>(() => {
        if (!scheduleId) return undefined
        const candidates = qc.getQueriesData<InfiniteData<any>>({ queryKey: SCHEDULES_LIST_KEY_PREFIX })
        for (const [, data] of candidates) {
            if (!data) continue
            const pages = Array.isArray((data as any).pages) ? (data as any).pages : []
            const allItems = pages.flatMap((p: any) => p?.items ?? p?.data ?? [])
            const found = allItems.find((s: any) => s?.id === scheduleId)
            if (found) return found as Schedule
        }
        return undefined
    }, [qc, scheduleId])

    const {
        data: schedule,
        isLoading: scheduleLoading,
        isFetching,
        isError,
        error,
    } = useQuery({
        enabled: !!scheduleId,
        queryKey: ["schedule", scheduleId],
        queryFn: () => getScheduleById(scheduleId as string),
        initialData: initialFromCache,
        staleTime: initialFromCache ? 30_000 : 0,
        retry: 1,
    })

    const { data: favorites = [], isLoading: favLoading } = useFavorites()
    const { addM, removeM } = useFavoritesMutations()

    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    const isRouteFavorite = useMemo(() => {
        if (!schedule) return false
        return favorites.some((f) => f.route.id === schedule.routeId)
    }, [favorites, schedule])

    const handleToggleFavorite = async () => {
        if (!schedule) return
        try {
            if (isRouteFavorite) {
                await removeM.mutateAsync(schedule.routeId)
                setAlertMessage("Removed from favorites")
            } else {
                await addM.mutateAsync(schedule.routeId)
                setAlertMessage("Added to favorites")
            }
            setShowAlert(true)
        } catch {
            setAlertMessage("Failed to update favorites")
            setShowAlert(true)
        }
    }

    const handleShare = async () => {
        if (!schedule) return
        try {
            await Share.share({
                message: `Check out this train schedule: ${schedule.route?.name ?? "Route"} departing at ${formatTime(
                    schedule.departAt
                )} on ${formatDate(schedule.departAt)}`,
                title: "Train Schedule",
            })
        } catch (err) {
            console.error("Share failed:", err)
        }
    }

    if (scheduleLoading && !initialFromCache) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]} edges={["top", "left", "right"]}>
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={onBack} style={styles.navBtn}>
                        <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                    <Text style={styles.appBarTitle}>Schedule</Text>
                    <View style={styles.navBtn} />
                </View>
                <ActivityIndicator />
            </SafeAreaView>
        )
    }

    if (isError && !schedule) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={onBack} style={styles.navBtn}>
                        <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                    <Text style={styles.appBarTitle}>Schedule</Text>
                    <View style={styles.navBtn} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="warning-outline" size={64} color="#FF3B30" />
                    <Text style={styles.emptyStateText}>{(error as any)?.message || "Failed to load schedule"}</Text>
                    <Button title="Go Back" onPress={onBack} style={styles.backButton} />
                </View>
            </SafeAreaView>
        )
    }

    if (!schedule) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={onBack} style={styles.navBtn}>
                        <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                    <Text style={styles.appBarTitle}>Schedule</Text>
                    <View style={styles.navBtn} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="train" size={64} color="#8E8E93" />
                    <Text style={styles.emptyStateText}>Schedule not found</Text>
                    <Button title="Go Back" onPress={onBack} style={styles.backButton} />
                </View>
            </SafeAreaView>
        )
    }

    const routeName = schedule.route?.name ?? "Route"
    const routeCode = schedule.route?.code
    const stops = schedule.route?.stops ?? []

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.appBar}>
                <TouchableOpacity onPress={onBack} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>Schedule</Text>
                <View style={styles.navBtn} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
                <Card style={styles.headerCard}>
                    <View style={styles.routeHeader}>
                        <View style={styles.routeInfo}>
                            <Text style={styles.routeName}>{routeName}</Text>
                            {!!routeCode && <Text style={styles.routeCode}>{routeCode}</Text>}
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleToggleFavorite}
                                disabled={favLoading || addM.isPending || removeM.isPending}
                            >
                                <Ionicons name={isRouteFavorite ? "heart" : "heart-outline"} size={24} color="#FF3B30" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Ionicons name="share-outline" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.trainTypeContainer}>
                        <Ionicons name="train" size={20} color="#007AFF" />
                        <Text style={styles.trainType}>{schedule.trainType.replace("_", " ")}</Text>
                        {isFetching ? <ActivityIndicator style={{ marginLeft: 8 }} /> : null}
                    </View>
                </Card>

                <Card style={styles.journeyCard}>
                    <Text style={styles.sectionTitle}>Journey Details</Text>

                    <View style={styles.journeyInfo}>
                        <View style={styles.timeSection}>
                            <Text style={styles.timeLabel}>Departure</Text>
                            <Text style={styles.time}>{formatTime(schedule.departAt)}</Text>
                            <Text style={styles.date}>{formatDate(schedule.departAt)}</Text>
                        </View>

                        <View style={styles.durationSection}>
                            <Ionicons name="time-outline" size={20} color="#8E8E93" />
                            <Text style={styles.duration}>{formatDuration(schedule.departAt, schedule.arriveAt)}</Text>
                        </View>

                        <View style={styles.timeSection}>
                            <Text style={styles.timeLabel}>Arrival</Text>
                            <Text style={styles.time}>{formatTime(schedule.arriveAt)}</Text>
                            <Text style={styles.date}>{formatDate(schedule.arriveAt)}</Text>
                        </View>
                    </View>
                </Card>

                <Card style={styles.statusCard}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.statusInfo}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(schedule.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(schedule.status) }]}>
                            {getStatusText(schedule.status)}
                            {schedule.delayMinutes > 0 && ` (+${schedule.delayMinutes} minutes)`}
                        </Text>
                    </View>
                </Card>

                <Card style={styles.stopsCard}>
                    <Text style={styles.sectionTitle}>Route Stops</Text>
                    {stops.map((routeStop, index) => (
                        <View key={routeStop.stop.id} style={styles.stopItem}>
                            <View style={styles.stopIndicator}>
                                <View
                                    style={[
                                        styles.stopDot,
                                        index === 0 && styles.firstStop,
                                        index === stops.length - 1 && styles.lastStop,
                                    ]}
                                />
                                {index < stops.length - 1 && <View style={styles.stopLine} />}
                            </View>
                            <View style={styles.stopInfo}>
                                <Text style={styles.stopName}>{routeStop.stop.name}</Text>
                                {routeStop.stop.city && <Text style={styles.stopCity}>{routeStop.stop.city}</Text>}
                                {routeStop.minutesFromStart != null && (
                                    <Text style={styles.stopTime}>+{routeStop.minutesFromStart} minutes</Text>
                                )}
                            </View>
                        </View>
                    ))}
                    {stops.length === 0 && <Text style={{ color: "#8E8E93" }}>No stops provided for this route.</Text>}
                </Card>
            </ScrollView>

            <Alert
                visible={showAlert}
                title="Success"
                message={alertMessage}
                type="success"
                onClose={() => setShowAlert(false)}
            />
        </SafeAreaView>
    )
}


const CHIP_PAD_H = Layout.spacing.sm + Layout.spacing.xs
const CHIP_PAD_V = Layout.spacing.sm
const GAP_12 = Layout.spacing.sm + Layout.spacing.xs

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surfaceSecondary,
    },

    appBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.md,
        paddingBottom: Layout.spacing.xs,
    },

    navBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },

    appBarTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: Layout.fontSize.lg,
        fontWeight: "700",
        color: Colors.text,
    },

    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Layout.spacing.xl,
    },

    emptyStateText: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginTop: Layout.spacing.md,
        marginBottom: Layout.spacing.lg,
    },

    backButton: {
        minWidth: 120,
    },

    headerCard: {
        margin: Layout.spacing.md,
        marginBottom: Layout.spacing.sm,
    },

    routeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: GAP_12,
    },

    routeInfo: {
        flex: 1,
    },

    routeName: {
        fontSize: Layout.fontSize.xxl,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },

    routeCode: {
        fontSize: Layout.fontSize.md,
        color: Colors.accent,
    },

    headerActions: {
        flexDirection: "row",
    },

    actionButton: {
        padding: Layout.spacing.sm,
        marginLeft: Layout.spacing.sm,
    },

    trainTypeContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.background,
        paddingHorizontal: CHIP_PAD_H,
        paddingVertical: CHIP_PAD_V,
        borderRadius: Layout.borderRadius.md,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: Colors.info,
    },

    trainType: {
        fontSize: Layout.fontSize.sm,
        color: Colors.info,
        fontWeight: "600",
        marginLeft: Layout.spacing.sm,
    },

    journeyCard: {
        marginHorizontal: Layout.spacing.md,
        marginBottom: Layout.spacing.sm,
    },

    sectionTitle: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.lg,
    },

    journeyInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    timeSection: {
        flex: 1,
        alignItems: "center",
    },

    timeLabel: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Layout.spacing.sm,
    },

    time: {
        fontSize: Layout.fontSize.xxl,
        fontWeight: "700",
        color: Colors.accent,
        marginBottom: Layout.spacing.xs,
    },

    date: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
        textAlign: "center",
    },

    durationSection: {
        alignItems: "center",
        paddingHorizontal: Layout.spacing.md,
    },

    duration: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginTop: Layout.spacing.xs,
    },

    statusCard: {
        marginHorizontal: Layout.spacing.md,
        marginBottom: Layout.spacing.sm,
    },

    statusInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: GAP_12,
    },

    statusText: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
    },

    stopsCard: {
        marginHorizontal: Layout.spacing.md,
        marginBottom: Layout.spacing.xl,
    },

    stopItem: {
        flexDirection: "row",
        marginBottom: Layout.spacing.md,
    },

    stopIndicator: {
        alignItems: "center",
        marginRight: Layout.spacing.md,
    },

    stopDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.textSecondary,
    },

    firstStop: {
        backgroundColor: Colors.success,
    },

    lastStop: {
        backgroundColor: Colors.error,
    },

    stopLine: {
        width: 2,
        height: 24,
        backgroundColor: Colors.border,
        marginTop: Layout.spacing.xs,
    },

    stopInfo: {
        flex: 1,
    },

    stopName: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 2,
    },

    stopCity: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginBottom: 2,
    },

    stopTime: {
        fontSize: Layout.fontSize.xs,
        color: Colors.info,
    },
})

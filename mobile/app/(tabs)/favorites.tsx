import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Card } from "../../src/components/ui/Card"
import { Button } from "../../src/components/ui/Button"
import { Alert } from "../../src/components/ui/Alert"
import type { Favorite, Schedule } from "../../src/types/api"

import { useFavorites, useFavoritesMutations } from "../../src/hooks/queries/useFavorites"
import { useQueries } from "@tanstack/react-query"
import { getSchedules } from "../../src/services/schedules.api"

import { Colors } from "../../src/constants/Colors"
import { Layout } from "../../src/constants/Layout"

export default function FavoritesScreen() {
    const router = useRouter()

    const { data: favorites = [], refetch: refetchFavorites, isLoading: favLoading } = useFavorites()
    const { removeM } = useFavoritesMutations()

    const [refreshing, setRefreshing] = useState(false)
    const [deleteAlert, setDeleteAlert] = useState<{ visible: boolean; favorite: Favorite | null }>({
        visible: false,
        favorite: null,
    })
    const [error, setError] = useState<string | null>(null)
    const clearError = () => setError(null)

    const today = useMemo(() => new Date(), [])
    const dateStr = useMemo(() => today.toISOString().slice(0, 10), [today])

    const scheduleQueries = useQueries({
        queries: favorites.map((fav) => ({
            queryKey: ["route-schedules", fav.route.id, dateStr],
            queryFn: () =>
                getSchedules({ date: dateStr, routeId: fav.route.id, page: 1, pageSize: 25 }),
            enabled: !!fav.route.id,
            staleTime: 30_000,
        })),
    })

    const upcomingByRoute = useMemo(() => {
        const now = new Date()
        const map: Record<string, Schedule[]> = {}
        favorites.forEach((fav, idx) => {
            const q = scheduleQueries[idx]
            const items = (q.data?.items ?? []) as Schedule[]
            const upcoming = items
                .filter((s) => new Date(s.departAt) > now)
                .sort((a, b) => new Date(a.departAt).getTime() - new Date(b.departAt).getTime())
                .slice(0, 3)
            map[fav.route.id] = upcoming
        })
        return map
    }, [favorites, scheduleQueries])

    const loadData = async () => {
        try {
            await refetchFavorites()
        } catch (e: any) {
            setError(e?.message ?? "Failed to load favorites")
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
        setRefreshing(false)
    }

    const handleRemoveFavorite = async (favorite: Favorite) => {
        try {
            await removeM.mutateAsync(favorite.route.id)
            setDeleteAlert({ visible: false, favorite: null })
        } catch (e: any) {
            setError(e?.message ?? "Failed to remove favorite")
        }
    }

    const showDeleteAlert = (favorite: Favorite) => setDeleteAlert({ visible: true, favorite })
    const hideDeleteAlert = () => setDeleteAlert({ visible: false, favorite: null })

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString([], { month: "short", day: "numeric" })

    const renderFavorite = ({ item }: { item: Favorite }) => {
        const upcomingSchedules = upcomingByRoute[item.route.id] ?? []

        return (
            <Card style={styles.favoriteCard}>
                <View style={styles.favoriteHeader}>
                    <View style={styles.routeInfo}>
                        <Text style={styles.routeName}>{item.route.name}</Text>
                        {item.route.code && <Text style={styles.routeCode}>{item.route.code}</Text>}
                    </View>
                    <TouchableOpacity style={styles.removeButton} onPress={() => showDeleteAlert(item)}>
                        <Ionicons name="heart" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                {upcomingSchedules.length > 0 ? (
                    <View style={styles.upcomingSchedules}>
                        <Text style={styles.upcomingTitle}>Upcoming Departures</Text>
                        {upcomingSchedules.map((schedule) => (
                            <TouchableOpacity
                                key={schedule.id}
                                style={styles.scheduleItem}
                                onPress={() =>
                                    router.push({ pathname: "/schedule/[id]", params: { id: schedule.id } })
                                }
                            >
                                <View style={styles.scheduleTime}>
                                    <Text style={styles.time}>{formatTime(schedule.departAt)}</Text>
                                    <Text style={styles.date}>{formatDate(schedule.departAt)}</Text>
                                </View>
                                <View style={styles.scheduleInfo}>
                                    <Text style={styles.trainType}>{schedule.trainType.replace("_", " ")}</Text>
                                    <Text
                                        style={[
                                            styles.status,
                                            { color: schedule.status === "ON_TIME" ? "#34C759" : "#FF9500" },
                                        ]}
                                    >
                                        {schedule.status === "ON_TIME" ? "On Time" : "Delayed"}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noSchedules}>
                        <Text style={styles.noSchedulesText}>No upcoming schedules</Text>
                    </View>
                )}

                <Button
                    title="View All Schedules"
                    variant="outline"
                    onPress={() => router.push("/(tabs)")}
                    style={styles.viewAllButton}
                />
            </Card>
        )
    }

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No favorite routes yet</Text>
            <Text style={styles.emptyStateSubtext}>
                Add routes to your favorites by tapping the heart icon on any schedule
            </Text>
            <Button title="Browse Schedules" onPress={() => router.push("/(tabs)")} style={styles.browseButton} />
        </View>
    )

    return (
        <View style={styles.container}>
            <FlatList
                data={favorites}
                renderItem={renderFavorite}
                keyExtractor={(item) => item.route.id}
                contentContainerStyle={[styles.listContainer, favorites.length === 0 && styles.emptyContainer]}
                refreshControl={<RefreshControl refreshing={refreshing || favLoading} onRefresh={handleRefresh} tintColor="#007AFF" />}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />

            <Alert
                visible={deleteAlert.visible}
                title="Remove Favorite"
                message={`Remove "${deleteAlert.favorite?.route.name}" from your favorites?`}
                type="warning"
                onClose={hideDeleteAlert}
                actions={[
                    { text: "Cancel", onPress: hideDeleteAlert, style: "cancel" },
                    { text: "Remove", onPress: () => deleteAlert.favorite && handleRemoveFavorite(deleteAlert.favorite), style: "destructive" },
                ]}
            />

            {error && <Alert visible={!!error} title="Error" message={error} type="error" onClose={clearError} />}
        </View>
    )
}

const SUBTEXT_LINE_HEIGHT = Math.round(Layout.fontSize.sm * 1.43) // ≈20 for 14px

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    listContainer: {
        padding: Layout.spacing.md,
    },

    emptyContainer: {
        flex: 1,
    },

    favoriteCard: {
        marginBottom: Layout.spacing.md,
    },

    favoriteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: Layout.spacing.md,
    },

    routeInfo: {
        flex: 1,
    },

    routeName: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },

    routeCode: {
        fontSize: Layout.fontSize.sm,
        color: Colors.accent,
    },

    removeButton: {
        padding: Layout.spacing.xs,
    },

    upcomingSchedules: {
        marginBottom: Layout.spacing.md,
    },

    upcomingTitle: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.sm + Layout.spacing.xs, // ~12
    },

    scheduleItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Layout.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },

    scheduleTime: {
        marginRight: Layout.spacing.md,
    },

    time: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
    },

    date: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
    },

    scheduleInfo: {
        flex: 1,
    },

    trainType: {
        fontSize: Layout.fontSize.sm,
        color: Colors.info,
        fontWeight: "600",
    },

    status: {
        fontSize: Layout.fontSize.xs,
        fontWeight: "600",
        marginTop: 2,
    },

    noSchedules: {
        paddingVertical: Layout.spacing.md,
        alignItems: "center",
    },

    noSchedulesText: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
    },

    viewAllButton: {
        marginTop: Layout.spacing.sm,
    },

    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.xl,
    },

    emptyStateText: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginTop: Layout.spacing.md,
        textAlign: "center",
    },

    emptyStateSubtext: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: Layout.spacing.sm,
        lineHeight: SUBTEXT_LINE_HEIGHT,
    },

    browseButton: {
        marginTop: Layout.spacing.lg,
        minWidth: 160,
    },
})

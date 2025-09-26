import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuthStore } from "../../src/stores/auth-store"
import { ScheduleCard } from "../../src/components/schedule/ScheduleCard"
import { Button } from "../../src/components/ui/Button"
import { Card } from "../../src/components/ui/Card"
import { Alert as UiAlert } from "../../src/components/ui/Alert"
import { CreateScheduleModal } from "../../src/components/admin/CreateScheduleModal"
import { EditScheduleModal } from "../../src/components/admin/EditScheduleModal"
import { Colors } from "../../src/constants/Colors"
import { Layout } from "../../src/constants/Layout"
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from "../../src/types/api"

import { useInfiniteSchedules, useScheduleMutations } from "../../src/hooks/queries/useSchedules"
import { useRoutes } from "../../src/hooks/queries/useRoutes"
import { useScheduleStore } from "../../src/stores/schedule-store"

export default function AdminScreen() {
    const router = useRouter()
    const { user } = useAuthStore()

    const { data: routes = [], refetch: refetchRoutes } = useRoutes()

    const { selectedDate, selectedRouteId, selectedTrainType, pageSize, setFilters } = useScheduleStore()
    const filters = useMemo(
        () => ({ date: selectedDate, routeId: selectedRouteId, trainType: selectedTrainType, pageSize: pageSize ?? 20 }),
        [selectedDate, selectedRouteId, selectedTrainType, pageSize]
    )

    const { data, isLoading, isRefetching, refetch } = useInfiniteSchedules(filters)
    const { createM, updateM, deleteM } = useScheduleMutations(filters)

    const [error, setError] = useState<string | null>(null)
    const clearError = () => setError(null)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
    const [deleteAlert, setDeleteAlert] = useState<{ visible: boolean; schedule: Schedule | null }>({
        visible: false, schedule: null,
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            await Promise.all([refetchRoutes(), refetch()])
        } catch (e: any) {
            setError(e?.message ?? "Failed to load data")
        }
    }

    const handleDeleteSchedule = async (schedule: Schedule) => {
        try {
            await deleteM.mutateAsync(schedule.id)
            setDeleteAlert({ visible: false, schedule: null })
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete schedule")
        }
    }

    const showDeleteAlert = (schedule: Schedule) => setDeleteAlert({ visible: true, schedule })
    const hideDeleteAlert = () => setDeleteAlert({ visible: false, schedule: null })

    const onCreate = async (payload: CreateScheduleRequest) => {
        try {
            await createM.mutateAsync(payload)
            setShowCreateModal(false)
        } catch (e: any) {
            setError(e?.message ?? "Failed to create schedule")
        }
    }

    const onUpdate = async (id: string, payload: UpdateScheduleRequest) => {
        try {
            await updateM.mutateAsync({ id, data: payload })
            setEditingSchedule(null)
        } catch (e: any) {
            setError(e?.message ?? "Failed to update schedule")
        }
    }

    const goManageRoutes = () => {
        router.push("/admin/routes")
    }

    const goViewAll = () => {
        setFilters({ date: new Date().toISOString().slice(0, 10), routeId: undefined, trainType: undefined })
        router.push("/(tabs)")
    }

    const schedules = data?.items ?? []

    const onTimeSchedules = schedules.filter((s) => s.status === "ON_TIME").length
    const delayedSchedules = schedules.filter((s) => s.status === "DELAYED").length
    const cancelledSchedules = schedules.filter((s) => s.status === "CANCELLED").length

    if (user?.role !== "ADMIN") {
        return (
            <View style={styles.container}>
                <View style={styles.unauthorizedContainer}>
                    <Ionicons name="lock-closed" size={64} color={Colors.textSecondary} />
                    <Text style={styles.unauthorizedText}>Access Denied</Text>
                    <Text style={styles.unauthorizedSubtext}>You don't have permission to access this area.</Text>
                </View>
            </View>
        )
    }

    const StatCard = ({
                          title, value, icon, color = Colors.primary,
                      }: { title: string; value: string | number; icon: keyof typeof Ionicons.glyphMap; color?: string }) => (
        <Card style={[styles.statCard, { backgroundColor: color === Colors.primary ? Colors.primaryLight + "20" : `${color}20` }]}>
            <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: color === Colors.primary ? Colors.primaryLight + "20" : `${color}20` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.statText}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                </View>
            </View>
        </Card>
    )

    return (
        <View style={styles.container}>
            <ScrollView refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={loadData} />}>
                <View style={styles.statsContainer}>
                    <StatCard title="Total Schedules" value={schedules.length} icon="train" color={Colors.accent} />
                    <StatCard title="On Time" value={onTimeSchedules} icon="checkmark-circle" color={Colors.success} />
                    <StatCard title="Delayed" value={delayedSchedules} icon="time" color={Colors.warning} />
                    <StatCard title="Cancelled" value={cancelledSchedules} icon="close-circle" color={Colors.error} />
                </View>

                <Card style={styles.actionsCard}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionButtons}>
                        <Button title="Add Schedule" onPress={() => setShowCreateModal(true)} style={styles.actionButton} />
                        <Button title="Manage Routes" onPress={goManageRoutes} variant="outline" style={styles.actionButton} />
                    </View>
                </Card>

                <Card style={styles.schedulesCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Schedules</Text>
                        <TouchableOpacity onPress={goViewAll}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {schedules.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="train" size={48} color={Colors.textSecondary} />
                            <Text style={styles.emptyStateText}>No schedules found</Text>
                            <Text style={styles.emptyStateSubtext}>Create your first schedule to get started</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={schedules.slice(0, 5)}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ScheduleCard
                                    schedule={item}
                                    showActions
                                    onEdit={() => setEditingSchedule(item)}
                                    onDelete={() => showDeleteAlert(item)}
                                />
                            )}
                            scrollEnabled={false}
                        />
                    )}
                </Card>
            </ScrollView>

            <CreateScheduleModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                routes={routes}
                onSubmit={onCreate}
            />
            <EditScheduleModal
                visible={!!editingSchedule}
                schedule={editingSchedule}
                onClose={() => setEditingSchedule(null)}
                onSubmit={(values) => editingSchedule && onUpdate(editingSchedule.id, values as UpdateScheduleRequest)}
            />

            <UiAlert
                visible={deleteAlert.visible}
                title="Delete Schedule"
                message={`Are you sure you want to delete the schedule for "${deleteAlert.schedule?.route.name}"?`}
                type="warning"
                onClose={hideDeleteAlert}
                actions={[
                    { text: "Cancel", onPress: hideDeleteAlert, style: "cancel" },
                    { text: "Delete", onPress: () => deleteAlert.schedule && handleDeleteSchedule(deleteAlert.schedule), style: "destructive" },
                ]}
            />

            {/* Error Alert */}
            {error && <UiAlert visible={!!error} title="Error" message={error} type="error" onClose={clearError} />}
        </View>
    )
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    unauthorizedContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.xl,
    },

    unauthorizedText: {
        fontSize: Layout.fontSize.xxl,
        fontWeight: "700",
        color: Colors.text,
        marginTop: Layout.spacing.md,
        textAlign: "center",
    },

    unauthorizedSubtext: {
        fontSize: Layout.fontSize.md,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: Layout.spacing.sm,
    },

    statsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: Layout.spacing.md,
        gap: Layout.spacing.sm,
    },

    statCard: {
        flex: 1,
        minWidth: "45%",
        marginBottom: 0,
        backgroundColor: Colors.surface,
    },

    statContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    statIcon: {
        width: 48,
        height: 48,
        borderRadius: Layout.borderRadius.xl,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Layout.spacing.sm,
    },

    statText: {
        flex: 1,
    },

    statValue: {
        fontSize: Layout.fontSize.xxl,
        fontWeight: "700",
        color: Colors.text,
    },

    statTitle: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    actionsCard: {
        marginHorizontal: Layout.spacing.md,
        marginBottom: Layout.spacing.md,
        backgroundColor: Colors.surface,
    },

    sectionTitle: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.md,
    },

    actionButtons: {
        flexDirection: "row",
        gap: Layout.spacing.sm,
    },

    actionButton: {
        flex: 1,
    },

    schedulesCard: {
        marginHorizontal: Layout.spacing.md,
        marginBottom: Layout.spacing.md,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Layout.spacing.md,
    },

    viewAllText: {
        fontSize: Layout.fontSize.md,
        color: Colors.express,
        fontWeight: "600",
    },

    emptyState: {
        alignItems: "center",
        paddingVertical: Layout.spacing.xl,
    },

    emptyStateText: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginTop: Layout.spacing.md,
    },

    emptyStateSubtext: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: Layout.spacing.sm,
    },
})

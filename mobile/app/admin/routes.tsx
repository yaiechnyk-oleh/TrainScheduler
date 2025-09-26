import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "../../src/constants/Colors"
import { Layout } from "../../src/constants/Layout"
import { Card } from "../../src/components/ui/Card"
import { Button } from "../../src/components/ui/Button"
import { Alert as UiAlert } from "../../src/components/ui/Alert"
import { useRoutes, useRouteMutations } from "../../src/hooks/queries/useRoutes"
import { useStops } from "../../src/hooks/queries/useStops"
import type { Route } from "../../src/types/api"

import { CreateRouteModal } from "../../src/components/admin/CreateRouteModal"
import { EditRouteModal } from "../../src/components/admin/EditRouteModal"
import { ManageStopsModal } from "../../src/components/admin/ManageStopsModal"

export default function AdminRoutesScreen() {
    const router = useRouter()
    const { data: routes = [], isLoading, refetch } = useRoutes()
    const { data: stops = [], isLoading: stopsLoading } = useStops()
    const { deleteM } = useRouteMutations()

    const [error, setError] = useState<string | null>(null)
    const clearError = () => setError(null)

    const [refreshing, setRefreshing] = useState(false)
    const [showCreate, setShowCreate] = useState(false)
    const [editing, setEditing] = useState<Route | null>(null)
    const [manageStopsRouteId, setManageStopsRouteId] = useState<string | null>(null)
    const [deleteAsk, setDeleteAsk] = useState<{ visible: boolean; route: Route | null }>({ visible: false, route: null })

    const onBack = () => {
        if (router.canGoBack?.()) router.back()
        else router.replace("/(tabs)")
    }

    const load = async () => {
        try {
            await Promise.all([refetch()])
        } catch (e: any) {
            setError(e?.message ?? "Failed to load data")
        }
    }

    useEffect(() => { load() }, []) // eslint-disable-line

    const onRefresh = async () => {
        setRefreshing(true)
        await load()
        setRefreshing(false)
    }

    const totalRoutes = routes.length
    const totalStops = stops.length

    const confirmDelete = (route: Route) => setDeleteAsk({ visible: true, route })
    const hideDeleteConfirm = () => setDeleteAsk({ visible: false, route: null })

    const doDelete = async () => {
        if (!deleteAsk.route) return
        try {
            await deleteM.mutateAsync(deleteAsk.route.id)
            hideDeleteConfirm()
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete route")
        }
    }

    const RouteRow = ({ item }: { item: Route }) => (
        <Card style={styles.routeCard}>
            <View style={styles.routeHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.routeName}>{item.name}</Text>
                    {!!item.code && <Text style={styles.routeCode}>{item.code}</Text>}
                </View>
                <View style={styles.actionsInline}>
                    <Button title="Stops" variant="outline" onPress={() => setManageStopsRouteId(item.id)} style={styles.rowBtn} />
                    <Button title="Edit" variant="outline" onPress={() => setEditing(item)} style={styles.rowBtn} />
                    <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={22} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    )

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.appBar}>
                <TouchableOpacity onPress={onBack} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>Routes & Stops</Text>
                <View style={styles.navBtn} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: Layout.spacing.lg }}
                refreshControl={
                    <RefreshControl refreshing={refreshing || isLoading || stopsLoading} onRefresh={onRefresh} />
                }
            >
                <View style={styles.statsContainer}>
                    <StatCard title="Total Routes" value={totalRoutes} icon="git-branch" color={Colors.accent} />
                    <StatCard title="Total Stops" value={totalStops} icon="flag" color={Colors.primary} />
                </View>

                <Card style={styles.actionsCard}>
                    <Text style={styles.sectionTitle}>Manage</Text>
                    <View style={styles.actionButtons}>
                        <Button title="Add Route" onPress={() => setShowCreate(true)} style={styles.actionButton} />
                    </View>
                </Card>

                <Card style={styles.routesCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Routes</Text>
                    </View>

                    {routes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="git-branch-outline" size={48} color={Colors.textSecondary} />
                            <Text style={styles.emptyStateText}>No routes yet</Text>
                        </View>
                    ) : (
                        <FlatList data={routes} keyExtractor={(r) => r.id} renderItem={RouteRow} scrollEnabled={false} />
                    )}
                </Card>
            </ScrollView>

            <CreateRouteModal visible={showCreate} onClose={() => setShowCreate(false)} />
            <EditRouteModal visible={!!editing} route={editing} onClose={() => setEditing(null)} />
            <ManageStopsModal visible={!!manageStopsRouteId} routeId={manageStopsRouteId} onClose={() => setManageStopsRouteId(null)} />

            <UiAlert
                visible={deleteAsk.visible}
                title="Delete Route"
                message={`Are you sure you want to delete "${deleteAsk.route?.name}"?`}
                type="warning"
                onClose={hideDeleteConfirm}
                actions={[
                    { text: "Cancel", style: "cancel", onPress: hideDeleteConfirm },
                    { text: "Delete", style: "destructive", onPress: doDelete },
                ]}
            />

            {error && <UiAlert visible={!!error} title="Error" message={error} type="error" onClose={clearError} />}
        </SafeAreaView>
    )
}

function StatCard({ title, value, icon, color = Colors.primary }: { title: string; value: string | number; icon: keyof typeof Ionicons.glyphMap; color?: string }) {
    return (
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
}

const NAV_BTN_SIZE = Layout.spacing.xl + Layout.spacing.sm
const ROUTE_CARD_MB = Layout.spacing.sm + Layout.spacing.xs

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    appBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.md,
        paddingBottom: Layout.spacing.xs,
    },

    navBtn: {
        width: NAV_BTN_SIZE,
        height: NAV_BTN_SIZE,
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
        width: Layout.spacing.xxl,
        height: Layout.spacing.xxl,
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

    routesCard: {
        marginHorizontal: Layout.spacing.md,
        marginBottom: Layout.spacing.md,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Layout.spacing.md,
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

    routeCard: {
        marginBottom: ROUTE_CARD_MB,
    },

    routeHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    routeName: {
        fontSize: Layout.fontSize.md,
        fontWeight: "700",
        color: Colors.text,
    },

    routeCode: {
        fontSize: Layout.fontSize.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    actionsInline: {
        flexDirection: "row",
        alignItems: "center",
    },

    rowBtn: {
        marginLeft: Layout.spacing.sm,
    },

    iconBtn: {
        padding: Layout.spacing.sm,
        marginLeft: Layout.spacing.sm,
    },
})
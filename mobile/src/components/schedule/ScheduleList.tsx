import type React from "react"
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ScheduleCard } from "./ScheduleCard"
import type { Schedule } from "../../types/api"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface ScheduleListProps {
    schedules: Schedule[]
    loading: boolean
    refreshing: boolean
    onRefresh: () => void
    onSchedulePress?: (schedule: Schedule) => void
    onLoadMore?: () => void
    hasMore?: boolean
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
                                                              schedules,
                                                              loading,
                                                              refreshing,
                                                              onRefresh,
                                                              onSchedulePress,
                                                              onLoadMore,
                                                              hasMore = false,
                                                          }) => {
    const renderSchedule = ({ item }: { item: Schedule }) => (
        <ScheduleCard schedule={item} onPress={() => onSchedulePress?.(item)} />
    )

    const renderFooter = () => {
        if (!hasMore) return null

        return <View style={styles.footer}>{loading && <ActivityIndicator size="small" color="#007AFF" />}</View>
    }

    const renderEmpty = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.emptyStateText}>Loading schedules...</Text>
                </View>
            )
        }

        return (
            <View style={styles.emptyState}>
                <Ionicons name="train" size={64} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No schedules found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your filters or selecting a different date</Text>
            </View>
        )
    }

    return (
        <FlatList
            data={schedules}
            renderItem={renderSchedule}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.container, schedules.length === 0 && styles.emptyContainer]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
        />
    )
}

export const styles = StyleSheet.create({
    container: {
        padding: Layout.spacing.md,
    },
    emptyContainer: {
        flex: 1,
    },
    footer: {
        paddingVertical: Layout.spacing.md + Layout.spacing.xs, // 20
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: Layout.spacing.xxl + Layout.spacing.md, // 64
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
        paddingHorizontal: Layout.spacing.xl,
        lineHeight: 20,
    },
})

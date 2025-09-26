import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Schedule } from "../../types/api"
import { Card } from "../ui/Card"
import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"
interface ScheduleCardProps {
    schedule: Schedule
    onPress?: () => void
    onEdit?: () => void
    onDelete?: () => void
    showActions?: boolean
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
                                                              schedule,
                                                              onPress,
                                                              onEdit,
                                                              onDelete,
                                                              showActions = false,
                                                          }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "ON_TIME":
                return Colors.online
            case "DELAYED":
                return Colors.delayed
            case "CANCELLED":
                return Colors.cancelled
            default:
                return Colors.offline
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

    const getTrainTypeIcon = (trainType: string) => {
        switch (trainType) {
            case "INTERCITY":
                return "flash"
            case "REGIONAL":
                return "train"
            case "NIGHT":
                return "moon"
            default:
                return "train"
        }
    }

    const getTrainTypeColor = (trainType: string) => {
        switch (trainType) {
            case "INTERCITY":
                return Colors.intercity
            case "REGIONAL":
                return Colors.regional
            case "NIGHT":
                return Colors.primary
            default:
                return Colors.local
        }
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <Card style={styles.card}>
            <TouchableOpacity onPress={onPress} disabled={!onPress}>
                <View style={styles.header}>
                    <View style={styles.routeInfo}>
                        <Text style={styles.routeName}>{schedule.route.name}</Text>
                        {schedule.route.code && <Text style={styles.routeCode}>{schedule.route.code}</Text>}
                    </View>
                    <View style={[styles.trainType, { backgroundColor: getTrainTypeColor(schedule.trainType) + "20" }]}>
                        <Ionicons
                            name={getTrainTypeIcon(schedule.trainType)}
                            size={20}
                            color={getTrainTypeColor(schedule.trainType)}
                        />
                        <Text style={[styles.trainTypeText, { color: getTrainTypeColor(schedule.trainType) }]}>
                            {schedule.trainType.replace("_", " ")}
                        </Text>
                    </View>
                </View>

                <View style={styles.timeInfo}>
                    <View style={styles.timeSection}>
                        <Text style={styles.timeLabel}>Departure</Text>
                        <Text style={styles.time}>{formatTime(schedule.departAt)}</Text>
                        <Text style={styles.date}>{formatDate(schedule.departAt)}</Text>
                    </View>

                    <View style={styles.arrow}>
                        <Ionicons name="arrow-forward" size={24} color={Colors.textSecondary} />
                    </View>

                    <View style={styles.timeSection}>
                        <Text style={styles.timeLabel}>Arrival</Text>
                        <Text style={styles.time}>{formatTime(schedule.arriveAt)}</Text>
                        <Text style={styles.date}>{formatDate(schedule.arriveAt)}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.status}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(schedule.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(schedule.status) }]}>
                            {getStatusText(schedule.status)}
                            {schedule.delayMinutes > 0 && ` (+${schedule.delayMinutes}m)`}
                        </Text>
                    </View>

                    {showActions && (
                        <View style={styles.actions}>
                            {onEdit && (
                                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                                    <Ionicons name="pencil" size={20} color={Colors.accent} />
                                </TouchableOpacity>
                            )}
                            {onDelete && (
                                <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                                    <Ionicons name="trash" size={20} color={Colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Card>
    )
}

export const styles = StyleSheet.create({
    card: {
        marginBottom: Layout.spacing.sm + Layout.spacing.xs,
    },
    header: {
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
    trainType: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.sm,
        paddingVertical: Layout.spacing.xs,
        borderRadius: Layout.borderRadius.md,
    },
    trainTypeText: {
        fontSize: Layout.fontSize.xs,
        fontWeight: "600",
        marginLeft: Layout.spacing.xs,
    },
    timeInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Layout.spacing.md,
    },
    timeSection: {
        flex: 1,
        alignItems: "center",
    },
    timeLabel: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
        marginBottom: Layout.spacing.xs,
    },
    time: {
        fontSize: Layout.fontSize.xl,
        fontWeight: "600",
        color: Colors.accent,
        marginBottom: 2,
    },
    date: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
    },
    arrow: {
        paddingHorizontal: Layout.spacing.md,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    status: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Layout.spacing.sm,
    },
    statusText: {
        fontSize: Layout.fontSize.sm,
        fontWeight: "600",
        color: Colors.text,
    },
    actions: {
        flexDirection: "row",
    },
    actionButton: {
        padding: Layout.spacing.sm,
        marginLeft: Layout.spacing.sm,
    },
})

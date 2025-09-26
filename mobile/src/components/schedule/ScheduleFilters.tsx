import type React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { FilterChip } from "../ui/FilterChip"
import { CustomDateTimePicker } from "../ui/DateTimePicker"
import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"
import type { Route } from "../../types/api"

interface ScheduleFiltersProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
    selectedTrainType?: string
    onTrainTypeChange: (type?: string) => void
    selectedRoute?: string
    onRouteChange: (routeId?: string) => void
    routes: Route[]
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
                                                                    selectedDate,
                                                                    onDateChange,
                                                                    selectedTrainType,
                                                                    onTrainTypeChange,
                                                                    selectedRoute,
                                                                    onRouteChange,
                                                                    routes,
                                                                }) => {
    const trainTypes = [
        { label: "All Types", value: undefined },
        { label: "Intercity", value: "INTERCITY" },
        { label: "Regional", value: "REGIONAL" },
        { label: "Night", value: "NIGHT" },
    ]

    const routeOptions = [
        { label: "All Routes", value: undefined },
        ...routes.map((route) => ({ label: route.name, value: route.id })),
    ]

    return (
        <View style={styles.container}>
            <CustomDateTimePicker
                label="Travel Date"
                value={selectedDate}
                onChange={onDateChange}
                mode="date"
                minimumDate={new Date()}
                containerStyle={styles.datePicker}
            />

            <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Train Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                    {trainTypes.map((type) => (
                        <FilterChip
                            key={type.label}
                            label={type.label}
                            selected={selectedTrainType === type.value}
                            onPress={() => onTrainTypeChange(type.value)}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Route</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                    {routeOptions.slice(0, 5).map((route) => (
                        <FilterChip
                            key={route.label}
                            label={route.label}
                            selected={selectedRoute === route.value}
                            onPress={() => onRouteChange(route.value)}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    datePicker: {
        marginBottom: Layout.spacing.md,
    },
    filterSection: {
        marginBottom: Layout.spacing.md,
    },
    filterTitle: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    chipContainer: {
        flexDirection: "row",
    },
})

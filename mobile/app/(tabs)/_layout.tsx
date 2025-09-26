import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../../src/stores/auth-store"

import { Colors } from "../../src/constants/Colors"

export default function TabLayout() {
    const { user } = useAuthStore()
    const isAdmin = user?.role === "ADMIN"

    return (
        <Tabs
            screenOptions={{
                headerShadowVisible: false,
                tabBarActiveTintColor: "#FF6B35",
                tabBarInactiveTintColor: "#94A3B8",
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                },
                headerStyle: {
                    backgroundColor: Colors.surface,
                },
                headerTintColor: Colors.surfaceDark,
                headerTitleStyle: {
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Schedules",
                    headerTitle: "Train Schedules",
                    tabBarIcon: ({ color, size }) => <Ionicons name="train" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    headerTitle: "Favorite Routes",
                    tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
                }}
            />

            {isAdmin && (
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: "Admin",
                        headerTitle: "Schedule Management",
                        tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                    }}
                />
            )}

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerTitle: "My Profile",
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    )
}

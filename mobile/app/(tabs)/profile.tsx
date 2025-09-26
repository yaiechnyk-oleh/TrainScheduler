import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuthStore } from "../../src/stores/auth-store"
import { Card } from "../../src/components/ui/Card"
import { Button } from "../../src/components/ui/Button"
import { Alert } from "../../src/components/ui/Alert"
import { Colors } from "../../src/constants/Colors"

export default function ProfileScreen() {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const [showLogoutAlert, setShowLogoutAlert] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            router.replace("/(auth)/login")
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const ProfileItem = ({
                             icon,
                             label,
                             value,
                             onPress,
                         }: {
        icon: keyof typeof Ionicons.glyphMap
        label: string
        value?: string
        onPress?: () => void
    }) => (
        <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
            <View style={styles.profileItemLeft}>
                <Ionicons name={icon} size={24} color={Colors.accent} />
                <Text style={styles.profileItemLabel}>{label}</Text>
            </View>
            <View style={styles.profileItemRight}>
                {value && <Text style={styles.profileItemValue}>{value}</Text>}
                {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.accent} />}
            </View>
        </TouchableOpacity>
    )

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.userCard}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color={Colors.textLight} />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user?.email}</Text>
                        <Text style={styles.userRole}>{user?.role === "ADMIN" ? "Administrator" : "User"}</Text>
                    </View>
                </View>
            </Card>

            <Card>
                <ProfileItem icon="mail" label="Email" value={user?.email} />
                <ProfileItem icon="shield-checkmark" label="Role" value={user?.role === "ADMIN" ? "Administrator" : "User"} />
            </Card>

            <View style={styles.logoutSection}>
                <Button title="Sign Out" onPress={() => setShowLogoutAlert(true)} />
            </View>

            <Alert
                visible={showLogoutAlert}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                onClose={() => setShowLogoutAlert(false)}
                actions={[
                    {
                        text: "Cancel",
                        onPress: () => setShowLogoutAlert(false),
                        style: "cancel",
                    },
                    {
                        text: "Sign Out",
                        onPress: handleLogout,
                        style: "destructive",
                    },
                ]}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 16,
    },
    userCard: {
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.accent,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    userRole: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    profileItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    profileItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    profileItemLabel: {
        fontSize: 16,
        color: Colors.text,
        marginLeft: 12,
    },
    profileItemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileItemValue: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginRight: 8,
    },
    logoutSection: {
        marginTop: 24,
        marginBottom: 32,
    },
})

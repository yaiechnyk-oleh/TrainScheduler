import React from "react"
import { Text, StyleSheet, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

interface ConnectionStatusProps {
    isConnected: boolean
    style?: any
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, style }) => {
    const opacity = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => {
        if (!isConnected) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            )
            pulse.start()

            return () => pulse.stop()
        } else {
            opacity.setValue(1)
        }
    }, [isConnected, opacity])

    if (isConnected) {
        return null
    }

    return (
        <Animated.View style={[styles.container, { opacity }, style]}>
            <Ionicons name="cloud-offline" size={16} color="#FF9500" />
            <Text style={styles.text}>Offline - Updates may be delayed</Text>
        </Animated.View>
    )
}

export const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.background,
        paddingHorizontal: Layout.spacing.sm + Layout.spacing.xs,
        paddingVertical: Layout.spacing.sm,
        borderRadius: Layout.borderRadius.md,
        marginBottom: Layout.spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: Colors.warning,
    },
    text: {
        fontSize: Layout.fontSize.xs,
        color: Colors.warning,
        marginLeft: Layout.spacing.xs,
        fontWeight: "600",
    },
})
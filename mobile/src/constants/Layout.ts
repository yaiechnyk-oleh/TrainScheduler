import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("window")

export const Layout = {
    window: {
        width,
        height,
    },
    isSmallDevice: width < 375,
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
} as const

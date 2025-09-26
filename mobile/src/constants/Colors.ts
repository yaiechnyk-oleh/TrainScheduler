export const Colors = {
    primary: "#0A0E27",
    primaryLight: "#1A1F3A",
    primaryDark: "#050812",

    accent: "#FF6B35",
    accentLight: "#FF8A5B",
    accentDark: "#E55A2B",

    secondary: "#4ECDC4",
    secondaryLight: "#7EDDD6",
    secondaryDark: "#3BA99F",

    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#007AFF",

    background: "#F8F9FA",
    surface: "#FFFFFF",
    surfaceSecondary: "#F2F2F7",
    surfaceDark: "#0A0E27",

    text: "#1C1C1E",
    textSecondary: "#8E8E93",
    textTertiary: "#C7C7CC",
    textLight: "#FFFFFF",
    textOnDark: "#F8F9FA",

    border: "#E5E5EA",
    borderSecondary: "#D1D1D6",
    borderLight: "#F2F2F7",

    online: "#34C759",
    offline: "#8E8E93",
    delayed: "#FF9500",
    cancelled: "#FF3B30",

    express: "#FF6B35",
    local: "#4ECDC4",
    regional: "#45B7D1",
    intercity: "#96CEB4",

    overlay: "rgba(10, 14, 39, 0.8)",
    overlayLight: "rgba(0, 0, 0, 0.5)",
} as const

export type ColorKey = keyof typeof Colors

import type { TextStyle } from "react-native";

export const theme = {
  colors: {
    // ── Legacy tokens (kept for backward compat) ──
    bg: {
      primary: "#0c0a09",
      card: "#1c1917",
      elevated: "#292524",
    },
    accent: {
      DEFAULT: "#f59e0b",
      light: "#ffb95f",
      dark: "#92400e",
    },
    semantic: {
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    text: {
      primary: "#fafaf9",
      secondary: "#a8a29e",
      muted: "#78716c",
    },
    neutral: "#404040",
    border: "#292524",

    // ── M3-inspired surface hierarchy ──
    background: "#0f0e0d",
    surface: {
      DEFAULT: "#151312",
      dim: "#151312",
      bright: "#3c3837",
      variant: "#373433",
      container: "#1d1b1a",
      containerLow: "#181615",
      containerHigh: "#221f1e",
      containerHighest: "#2c2928",
      containerLowest: "#0a0908",
    },
    onSurface: {
      DEFAULT: "#e8e1df",
      variant: "#a08e7a",
    },
    primary: {
      DEFAULT: "#ffb95f",
      container: "#f59e0b",
      onContainer: "#613b00",
    },
    outline: {
      DEFAULT: "#534434",
      variant: "#373433",
    },
    tertiary: "#51e77b",
  },

  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 20,
  },

  typography: {
    // ── Existing scales ──
    caption: {
      fontSize: 11,
      color: "#a8a29e",
    } as TextStyle,
    footnote: {
      fontSize: 13,
      color: "#a8a29e",
    } as TextStyle,
    body: {
      fontSize: 15,
      color: "#fafaf9",
    } as TextStyle,
    callout: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fafaf9",
    } as TextStyle,
    headline: {
      fontSize: 17,
      fontWeight: "700",
      color: "#fafaf9",
    } as TextStyle,
    title3: {
      fontSize: 20,
      fontWeight: "700",
      color: "#fafaf9",
    } as TextStyle,

    // ── New M3-inspired scales ──
    labelSmall: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 3,
      textTransform: "uppercase",
      color: "#a08e7a",
    } as TextStyle,
    labelMedium: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#a08e7a",
    } as TextStyle,
    titleLarge: {
      fontSize: 40,
      fontWeight: "900",
      letterSpacing: -2,
      color: "#e8e1df",
    } as TextStyle,
    headlineLarge: {
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -1,
      color: "#e8e1df",
    } as TextStyle,
  },
} as const;

export type Theme = typeof theme;

export function withAlpha(color: string, alpha: number): string {
  const hex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${hex}`;
}

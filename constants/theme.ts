import type { TextStyle } from "react-native";

export const theme = {
  colors: {
    // ── Legacy tokens (aliased to M3 hierarchy for visual consistency) ──
    bg: {
      primary: "#0f0e0d", // = background
      card: "#1d1b1a", // = surface.container
      elevated: "#221f1e", // = surface.containerHigh
    },
    accent: {
      DEFAULT: "#f59e0b", // = primary.container
      light: "#ffb95f", // = primary.DEFAULT
      dark: "#92400e",
    },
    semantic: {
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    text: {
      primary: "#e8e1df", // = onSurface.DEFAULT
      secondary: "#a08e7a", // = onSurface.variant
      muted: "#78716c",
    },
    neutral: "#534434", // = outline.DEFAULT
    border: "#373433", // = outline.variant

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
    // ── Existing scales (colors aligned to M3 onSurface tokens) ──
    caption: {
      fontSize: 11,
      color: "#a08e7a",
    } as TextStyle,
    footnote: {
      fontSize: 13,
      color: "#a08e7a",
    } as TextStyle,
    body: {
      fontSize: 15,
      color: "#e8e1df",
    } as TextStyle,
    callout: {
      fontSize: 16,
      fontWeight: "600",
      color: "#e8e1df",
    } as TextStyle,
    headline: {
      fontSize: 17,
      fontWeight: "700",
      color: "#e8e1df",
    } as TextStyle,
    title3: {
      fontSize: 20,
      fontWeight: "700",
      color: "#e8e1df",
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

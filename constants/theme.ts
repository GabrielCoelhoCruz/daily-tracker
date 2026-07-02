import type { TextStyle } from "react-native";

export const theme = {
  colors: {
    // ── Legacy tokens (aliased to M3 hierarchy for visual consistency) ──
    // Instrument Panel palette (design system v1.1 §3)
    bg: {
      primary: "#0c0a09", // = background (bg/base)
      card: "#1c1917", // = surface.container (bg/surface)
      elevated: "#292524", // = surface.containerHigh (bg/surface-2)
    },
    accent: {
      DEFAULT: "#f59e0b", // = primary.container (accent/primary)
      light: "#fbbf24", // = primary.DEFAULT
      dark: "#92400e",
    },
    semantic: {
      success: "#22c55e",
      warning: "#eab308",
      error: "#ef4444",
    },
    text: {
      primary: "#fafaf9", // = onSurface.DEFAULT
      secondary: "#a8a29e", // = onSurface.variant
      muted: "#78716c",
    },
    neutral: "#57534e", // = outline.DEFAULT (text/tertiary)
    border: "#292524", // = outline.variant (border/subtle)

    // ── M3-inspired surface hierarchy ──
    background: "#0c0a09",
    surface: {
      DEFAULT: "#131110",
      dim: "#131110",
      bright: "#3c3836",
      variant: "#292524",
      container: "#1c1917",
      containerLow: "#171412",
      containerHigh: "#221f1d",
      containerHighest: "#292524",
      containerLowest: "#0a0807",
    },
    onSurface: {
      DEFAULT: "#fafaf9",
      variant: "#a8a29e",
    },
    primary: {
      DEFAULT: "#fbbf24",
      container: "#f59e0b",
      onContainer: "#613b00",
    },
    outline: {
      DEFAULT: "#57534e",
      variant: "#292524",
    },
    tertiary: "#22c55e",
  },

  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 20,
  },

  // ── Font families ──
  // SpaceMono is the app's instrument voice: numerals, dates, micro-labels.
  fonts: {
    mono: "SpaceMono",
  },

  typography: {
    // ── Existing scales (colors aligned to M3 onSurface tokens) ──
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
    // Micro-labels speak in the app's "instrument" voice: SpaceMono, tracked out.
    labelSmall: {
      fontFamily: "SpaceMono",
      fontSize: 9,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      color: "#a8a29e",
    } as TextStyle,
    labelMedium: {
      fontFamily: "SpaceMono",
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#a8a29e",
    } as TextStyle,
    // ── Mono "instrument" voice (SpaceMono has a single weight — never bold it) ──
    overline: {
      fontFamily: "SpaceMono",
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: "#a8a29e",
    } as TextStyle,
    labelMono: {
      fontFamily: "SpaceMono",
      fontSize: 10,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: "#a8a29e",
    } as TextStyle,
    dataMono: {
      fontFamily: "SpaceMono",
      fontSize: 13,
      color: "#fafaf9",
      fontVariant: ["tabular-nums"],
    } as TextStyle,

    titleLarge: {
      fontSize: 40,
      fontWeight: "900",
      letterSpacing: -2,
      color: "#fafaf9",
    } as TextStyle,
    headlineLarge: {
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -1,
      color: "#fafaf9",
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

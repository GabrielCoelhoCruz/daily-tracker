import type { TextStyle } from "react-native";

export const theme = {
  colors: {
    bg: {
      primary: "#0c0a09",
      card: "#1c1917",
      elevated: "#292524",
    },
    accent: {
      DEFAULT: "#f59e0b",
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
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
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
  },
} as const;

export type Theme = typeof theme;

export function withAlpha(color: string, alpha: number): string {
  const hex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${hex}`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        mono: ["SpaceMono"],
      },
      colors: {
        // Instrument Panel palette (design system v1.1 §3)
        bg: {
          primary: "#0c0a09", // = background
          card: "#1c1917", // = surface.container
          elevated: "#292524", // = surface.containerHigh
        },
        accent: {
          DEFAULT: "#f59e0b", // = primary-m3.container
          light: "#fbbf24", // = primary-m3.DEFAULT
          dark: "#92400e",
        },
        semantic: {
          success: "#22c55e",
          warning: "#eab308",
          error: "#ef4444",
        },
        txt: {
          primary: "#fafaf9", // = on-surface.DEFAULT
          secondary: "#a8a29e", // = on-surface.variant
          muted: "#78716c",
        },
        border: {
          DEFAULT: "#292524", // = outline.variant
        },
        // M3-inspired surface hierarchy
        background: "#0c0a09",
        surface: {
          DEFAULT: "#131110",
          dim: "#131110",
          bright: "#3c3836",
          variant: "#292524",
          container: "#1c1917",
          "container-low": "#171412",
          "container-high": "#221f1d",
          "container-highest": "#292524",
          "container-lowest": "#0a0807",
        },
        "on-surface": {
          DEFAULT: "#fafaf9",
          variant: "#a8a29e",
        },
        "primary-m3": {
          DEFAULT: "#fbbf24",
          container: "#f59e0b",
        },
        outline: {
          DEFAULT: "#57534e",
          variant: "#292524",
        },
        tertiary: "#22c55e",
      },
    },
  },
  plugins: [],
};

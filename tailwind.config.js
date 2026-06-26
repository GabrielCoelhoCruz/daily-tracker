/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Legacy tokens (aliased to M3 hierarchy for visual consistency)
        bg: {
          primary: "#0f0e0d", // = background
          card: "#1d1b1a", // = surface.container
          elevated: "#221f1e", // = surface.containerHigh
        },
        accent: {
          DEFAULT: "#f59e0b", // = primary-m3.container
          light: "#ffb95f", // = primary-m3.DEFAULT
          dark: "#92400e",
        },
        semantic: {
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
        txt: {
          primary: "#e8e1df", // = on-surface.DEFAULT
          secondary: "#a08e7a", // = on-surface.variant
          muted: "#78716c",
        },
        border: {
          DEFAULT: "#373433", // = outline.variant
        },
        // M3-inspired surface hierarchy
        background: "#0f0e0d",
        surface: {
          DEFAULT: "#151312",
          dim: "#151312",
          bright: "#3c3837",
          variant: "#373433",
          container: "#1d1b1a",
          "container-low": "#181615",
          "container-high": "#221f1e",
          "container-highest": "#2c2928",
          "container-lowest": "#0a0908",
        },
        "on-surface": {
          DEFAULT: "#e8e1df",
          variant: "#a08e7a",
        },
        "primary-m3": {
          DEFAULT: "#ffb95f",
          container: "#f59e0b",
        },
        outline: {
          DEFAULT: "#534434",
          variant: "#373433",
        },
        tertiary: "#51e77b",
      },
    },
  },
  plugins: [],
};

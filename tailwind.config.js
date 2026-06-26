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
        // Legacy tokens
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
        txt: {
          primary: "#fafaf9",
          secondary: "#a8a29e",
          muted: "#78716c",
        },
        border: {
          DEFAULT: "#292524",
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

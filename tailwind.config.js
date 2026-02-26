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
        txt: {
          primary: "#fafaf9",
          secondary: "#a8a29e",
          muted: "#78716c",
        },
        border: {
          DEFAULT: "#292524",
        },
      },
    },
  },
  plugins: [],
};

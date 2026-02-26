/** @type {import('tailwindcss').Config} */
const tailwindAnimate = require("tailwindcss-animate");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0F1113",
          dark: "#08090A",
        },
        vault: {
          DEFAULT: "#1A2B3C",
          surface: "rgba(26, 43, 60, 0.6)",
        },
        emerald: {
          DEFAULT: "#3BCEAC",
          dark: "#2BA58B",
        },
        amber: "#F7C548",
        rust: "#E76F51",
        mint: "#8AC926",
        "text-primary": "#FAF9F6",
        "text-secondary": "#9BA3AF",
        "text-muted": "#64748B",
      },
      fontFamily: {
        display: ["IBM Plex Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        vault: "24px", // Changed from 48px to match our CSS variables
        card: "20px", // Changed from 24px to match our CSS variables
        pill: "40px",
      },
      boxShadow: {
        vault: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "emerald-glow": "0 0 20px rgba(59, 206, 172, 0.15)",
      },
      backgroundImage: {
        "glass-border":
          "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))",
      },
      // Add animation keyframes and animations
      keyframes: {
        "slide-in-from-top": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in-from-top": "slide-in-from-top 0.7s ease-out",
        "fade-in": "fade-in 1s ease-out",
        slideIn: "slideIn 0.3s ease",
      },
      // Add transition delays
      transitionDelay: {
        300: "300ms",
        500: "500ms",
        700: "700ms",
      },
      // Add z-index values if needed
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  plugins: [tailwindAnimate],
};

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
      },
      fontFamily: {
        display: ["IBM Plex Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        vault: "48px",
        card: "24px",
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
    },
  },
  plugins: [tailwindAnimate],
};

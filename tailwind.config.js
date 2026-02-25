/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0F1113",
        vault: "#1A2B3C",
        emerald: "#3BCEAC",
        amber: "#F7C548",
        rust: "#E76F51",
        mint: "#8AC926",
      },
      fontFamily: {
        display: ["IBM Plex Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        vault: "24px",
        card: "20px",
        pill: "40px",
      },
    },
  },
  plugins: [],
};

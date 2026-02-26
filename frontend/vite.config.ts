import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// NOTE: offline.html, manifest.json, service-worker.js and icons/ all belong
// in /public — Vite copies that directory to /dist automatically.
// public/
//   service-worker.js
//   manifest.json
//   offline.html
//   icons/
//     icon-96x96.png
//     icon-216x216.png

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    target: "es2020",
    sourcemap: false,

    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          "pdf-worker": ["pdfjs-dist"],
          vendor: ["react", "react-dom", "dexie"],
        },
      },
    },
  },

  publicDir: "public",
});
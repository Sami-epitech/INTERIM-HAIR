/**
 * Configuration de l'outil de build Vite.
 * Configure le support React, Tailwind CSS v4, l'écoute réseau multi-hôtes
 * et le proxy vers le serveur API backend pour les démonstrations locales et distantes.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});

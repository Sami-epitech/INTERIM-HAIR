// ════════════════════════════════════════════════════════════
// vite.config.ts
// ────────────────────────────────────────────────────────────
// Configuration de l'outil de build (Vite). Deux plugins :
//  - @vitejs/plugin-react : support JSX/TSX + Fast Refresh
//  - @tailwindcss/vite    : intègre Tailwind CSS v4 directement
//    au pipeline Vite (plus besoin de postcss.config.js)
// ════════════════════════════════════════════════════════════
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});

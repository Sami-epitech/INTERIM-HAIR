// ════════════════════════════════════════════════════════════
// main.tsx — point d'entrée de l'application React
// ────────────────────────────────────────────────────────────
// Ce fichier ne fait qu'une chose : accrocher le composant <App />
// à la balise <div id="root"> définie dans index.html.
// Toute la logique applicative vit dans App.tsx et les dossiers
// screens/ et components/.
// ════════════════════════════════════════════════════════════
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // styles globaux + thème Tailwind (palette de couleurs)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

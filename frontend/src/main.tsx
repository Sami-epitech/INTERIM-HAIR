/**
 * Point d'entrée principal de l'application React.
 * Monte le composant racine App sur le nœud DOM correspondant.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

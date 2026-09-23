/**
 * Point d'entrée principal de l'application React.
 * Monte le composant racine App sur le nœud DOM correspondant,
 * protégé par une barrière d'erreur (ErrorBoundary) pour éviter tout écran blanc.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[APPLICATION] Erreur d'exécution React interceptée :", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("Impossible de vider le stockage local :", e);
    }
    window.location.hash = "";
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h1 className="font-serif text-2xl text-foreground font-semibold mb-2">
              Une anomalie est survenue
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              L'application a rencontré une erreur inattendue lors de l'affichage.
            </p>
            {this.state.error?.message && (
              <pre className="text-xs bg-muted text-destructive p-3 rounded-lg text-left overflow-x-auto mb-6">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Recharger l'application
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 border border-border text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                Réinitialiser les données locales
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// ════════════════════════════════════════════════════════════
// screens/auth/AuthScreen.tsx
// ────────────────────────────────────────────────────────────
// Écran de connexion / inscription connecté à l'API Express.
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { AuthTab, Screen, UserMode } from "../../types";
import { AppName, BackBtn, Input, PrimaryButton } from "../../components/ui";

export function AuthScreen({ onNavigate, userMode }: { onNavigate: (s: Screen) => void; userMode: UserMode }) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log("👉 [FRONTEND] Clic sur le bouton de soumission détecté !");
    setErrorMsg(null);

    // Validation minimale côté front
    if (!email || !password) {
      const msg = "Veuillez remplir tous les champs requis.";
      console.warn("⚠️ [FRONTEND]", msg);
      setErrorMsg(msg);
      return;
    }

    setLoading(true);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload = { email, password, userMode, rememberMe };

    console.log(`📡 [FRONTEND] Envoi de la requête à http://localhost:8000${endpoint}`, {
      email,
      userMode,
      rememberMe,
    });

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de l'authentification.");
      }

      console.log("✅ [FRONTEND] Réponse positive du serveur :", data);

      // Stockage sécurisé du token JWT et de l'identifiant (sans passer par la barre d'URL)
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }

      // Redirection si l'API a répondu avec succès
      onNavigate(userMode === "candidate" ? "onboarding1" : "r-dashboard");

    } catch (err: any) {
      console.error("❌ [FRONTEND] Erreur lors de l'appel API :", err);
      setErrorMsg(err.message || "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* En-tête : retour au choix de rôle + rappel du rôle choisi */}
      <div className="px-5 pt-12 lg:pt-4 pb-2 flex items-center gap-3">
        <BackBtn onClick={() => onNavigate("role-select")} />
        <p className="text-xs text-muted-foreground">{userMode === "candidate" ? "Espace Intérimaire" : "Espace Recruteur·se"}</p>
      </div>

      <div className="px-5 pt-6 pb-4">
        <div className="lg:hidden"><AppName size="sm" /></div>
        <h2 className="font-serif text-3xl text-foreground leading-tight mt-3 lg:mt-0">
          {tab === "login" ? (
            <>
              Bon retour
              <br />
              parmi nous
            </>
          ) : (
            <>
              Créer
              <br />
              mon compte
            </>
          )}
        </h2>
      </div>

      <div className="flex-1 px-6 flex flex-col gap-6">
        {/* Onglets Connexion / Inscription */}
        <div className="flex gap-6 border-b border-border">
          {(["login", "signup"] as AuthTab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setErrorMsg(null);
              }}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
                tab === t ? "text-primary border-primary" : "text-muted-foreground border-transparent"
              }`}
            >
              {t === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Message d'erreur éventuel */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Champs du formulaire */}
        <div className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="marie@exemple.fr" value={email} onChange={setEmail} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
          
          <div className="flex items-center justify-between -mt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <span>Rester connecté ?</span>
            </label>
            {tab === "login" && <button type="button" className="text-xs text-primary font-medium">Mot de passe oublié ?</button>}
          </div>
        </div>

        {/* Bouton de soumission avec conteneur de secours au cas où PrimaryButton n'a pas de prop onClick directe */}
        <div onClick={handleSubmit}>
          <PrimaryButton disabled={loading}>
            {loading ? "Chargement..." : tab === "login" ? "Se connecter" : "Créer mon compte"}
          </PrimaryButton>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou continuer avec</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Boutons SSO */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              // Redirige directement vers le backend qui gère le flux OAuth Google
              window.location.href = "http://localhost:8000/api/auth/google";
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium hover:opacity-80 transition-opacity bg-white border-border text-foreground cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium hover:opacity-80 transition-opacity bg-foreground border-foreground text-primary-foreground opacity-60 cursor-not-allowed"
            title="Bientôt disponible"
          >
            <span className="text-base">⌘</span>
            <span>Apple</span>
          </button>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}
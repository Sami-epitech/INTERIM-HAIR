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
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log("👉 [FRONTEND] Clic sur le bouton de soumission détecté !");
    setErrorMsg(null);

    // Validation minimale côté front
    if (!email || !password || (tab === "signup" && !name)) {
      const msg = "Veuillez remplir tous les champs requis.";
      console.warn("⚠️ [FRONTEND]", msg);
      setErrorMsg(msg);
      return;
    }

    setLoading(true);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload = tab === "login" 
      ? { email, password, userMode } 
      : { name, email, password, userMode };

    console.log(`📡 [FRONTEND] Envoi de la requête à http://localhost:8000${endpoint}`, payload);

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
          {tab === "signup" && <Input label="Prénom & Nom" placeholder="Marie Dupont" value={name} onChange={setName} />}
          <Input label="Email" type="email" placeholder="marie@exemple.fr" value={email} onChange={setEmail} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
          {tab === "login" && <button className="text-xs text-primary font-medium text-right -mt-2">Mot de passe oublié ?</button>}
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

        {/* Boutons SSO (décoratifs) */}
        <div className="flex gap-3">
          {[
            { name: "Google", icon: "G", cls: "bg-white border-border text-foreground" },
            { name: "Apple", icon: "⌘", cls: "bg-foreground border-foreground text-primary-foreground" },
          ].map((sso) => (
            <button
              key={sso.name}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium hover:opacity-80 transition-opacity ${sso.cls}`}
            >
              <span className="text-base">{sso.icon}</span>
              <span>{sso.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}
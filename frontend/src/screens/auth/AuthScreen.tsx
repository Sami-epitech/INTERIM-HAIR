// ════════════════════════════════════════════════════════════
// screens/auth/AuthScreen.tsx
// ────────────────────────────────────────────────────────────
// Écran de connexion / inscription. Un seul composant pour les
// deux, avec un onglet interne (`tab`) — évite de dupliquer la
// mise en page entre deux écrans quasi identiques.
//
// ⚠️ Pour l'instant, les champs ne sont PAS envoyés au backend :
// cliquer sur "Se connecter"/"Créer mon compte" navigue directement
// vers l'étape suivante. À terme, `onClick` du PrimaryButton devra
// appeler POST /api/auth/login ou /api/auth/signup (voir
// backend/src/controllers/auth.controller.js) avant de naviguer.
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { AuthTab, Screen, UserMode } from "../../types";
import { AppName, BackBtn, Input, PrimaryButton } from "../../components/ui";

export function AuthScreen({ onNavigate, userMode }: { onNavigate: (s: Screen) => void; userMode: UserMode }) {
  const [tab, setTab] = useState<AuthTab>("login");
  // Champs de formulaire — état local car ils ne sont utiles qu'à cet écran
  // (rien d'autre dans l'app n'a besoin de connaître "email" en cours de saisie).
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* En-tête : retour au choix de rôle + rappel du rôle choisi */}
      <div className="px-5 pt-12 lg:pt-4 pb-2 flex items-center gap-3">
        <BackBtn onClick={() => onNavigate("role-select")} />
        <p className="text-xs text-muted-foreground">{userMode === "candidate" ? "Espace Intérimaire" : "Espace Recruteur·se"}</p>
      </div>

      <div className="px-5 pt-6 pb-4">
        {/* lg:hidden : sur grand écran, App.tsx affiche déjà la marque dans
            son panneau de gauche fixe — la répéter ici ferait doublon. */}
        <div className="lg:hidden"><AppName size="sm" /></div>
        {/* Le \n dans la chaîne + `whitespace-pre-line` (via leading-tight ci-dessous
            n'est pas suffisant seul) : ici on gère le retour à la ligne en le
            découpant nous-mêmes pour rester simple sans classe CSS supplémentaire. */}
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
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-200 ${
                tab === t ? "text-primary border-primary" : "text-muted-foreground border-transparent"
              }`}
            >
              {t === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Champs du formulaire — "Prénom & Nom" seulement en inscription */}
        <div className="flex flex-col gap-4">
          {tab === "signup" && <Input label="Prénom & Nom" placeholder="Marie Dupont" value={name} onChange={setName} />}
          <Input label="Email" type="email" placeholder="marie@exemple.fr" value={email} onChange={setEmail} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
          {tab === "login" && <button className="text-xs text-primary font-medium text-right -mt-2">Mot de passe oublié ?</button>}
        </div>

        {/* Après connexion : le candidat part en onboarding, le recruteur va direct à son dashboard */}
        <PrimaryButton onClick={() => onNavigate(userMode === "candidate" ? "onboarding1" : "r-dashboard")}>
          {tab === "login" ? "Se connecter" : "Créer mon compte"}
        </PrimaryButton>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou continuer avec</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Boutons SSO — purement décoratifs pour l'instant (pas de vraie intégration OAuth) */}
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

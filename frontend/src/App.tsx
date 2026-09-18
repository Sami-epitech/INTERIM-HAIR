// ════════════════════════════════════════════════════════════
// App.tsx — état global + "routeur" fait main
// ────────────────────────────────────────────────────────────
// [Branche feature/frontend-recruiter — tous les écrans sont
// maintenant branchés, l'app est fonctionnelle de bout en bout]
//
// L'app n'utilise pas de librairie de routing (react-router...) :
// vu le nombre d'écrans et le fait qu'ils s'enchaînent comme un
// parcours (wizard) plutôt que comme des pages indépendantes avec
// URL, un simple `useState<Screen>` + rendu conditionnel suffit et
// reste très lisible. L'écran affiché dépend uniquement de `screen`.
//
// C'est aussi ICI que vit tout l'état "partagé entre plusieurs
// écrans" (screen, userMode, selectedJob, missions, editingMission) :
// un écran ne connaît que ce qu'on lui passe en props, il ne va
// jamais chercher l'état d'un AUTRE écran directement.
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Job, Mission, Screen, UserMode } from "./types";
import { JOBS, MISSIONS_INIT } from "./data/mockData";
import { AppName } from "./components/ui";

import { RoleSelectScreen } from "./screens/auth/RoleSelectScreen";
import { AuthScreen } from "./screens/auth/AuthScreen";
import { Onboarding1Screen } from "./screens/onboarding/Onboarding1Screen";
import { CVUploadScreen } from "./screens/onboarding/CVUploadScreen";
import { ManualEntryScreen } from "./screens/onboarding/ManualEntryScreen";
import { Onboarding2Screen } from "./screens/onboarding/Onboarding2Screen";
import { FeedScreen } from "./screens/candidate/FeedScreen";
import { JobDetailScreen } from "./screens/candidate/JobDetailScreen";
import { CandidateDashboard } from "./screens/candidate/CandidateDashboard";
import { RecruiterDashboard } from "./screens/recruiter/RecruiterDashboard";
import { MissionCreateScreen } from "./screens/recruiter/MissionCreateScreen";
import { MissionEditScreen } from "./screens/recruiter/MissionEditScreen";

// ── Deux familles d'écrans, deux traitements de mise en page ──
//
// FORM_FLOW_SCREENS : les parcours linéaires (choix de rôle, connexion,
// inscription étape par étape...). Ce sont des formulaires qu'on lit de
// haut en bas — les laisser s'étirer sur toute la largeur d'un écran
// d'ordinateur les rendrait juste plus durs à lire. On les garde donc
// dans une carte centrée, façon "app mobile", même sur grand écran.
//
// Tout le reste (feed, dashboards...) gère DIRECTEMENT sa propre mise en
// page responsive (grilles, barre latérale...) — voir Sidebar.tsx et les
// classes lg:grid-cols-* dans FeedScreen/CandidateDashboard/RecruiterDashboard.
// Ces écrans-là ne doivent PAS être enfermés dans la carte étroite
// ci-dessous, sinon leurs grilles n'auraient jamais la place de s'afficher.
const FORM_FLOW_SCREENS: Screen[] = ["role-select", "auth", "onboarding1", "cv-upload", "manual-entry", "onboarding2"];

export default function App() {
  // Écran actuellement affiché. "role-select" = tout premier écran de l'app.
  const [screen, setScreen] = useState<Screen>("role-select");
  // Rôle choisi à l'écran role-select — conditionne le contenu de AuthScreen
  // et le parcours après connexion (onboarding candidat vs dashboard recruteur).
  const [userMode, setUserMode] = useState<UserMode>("candidate");
  // Offre actuellement consultée (positionnée par FeedScreen au clic sur "Postuler",
  // lue par JobDetailScreen).
  const [selectedJob, setSelectedJob] = useState<Job>(JOBS[0]);
  // Mission en cours d'édition (positionnée par RecruiterDashboard au clic sur
  // "Modifier", lue par MissionEditScreen).
  const [editingMission, setEditingMission] = useState<Mission>(MISSIONS_INIT[0]);
  // Missions du recruteur — état "source de vérité" pour tout le module recruteur.
  // Reste ici (et pas dans RecruiterDashboard) car MissionEditScreen doit
  // pouvoir le modifier alors que c'est un écran différent.
  const [missions, setMissions] = useState<Mission[]>(MISSIONS_INIT);

  // Raccourci utilisé partout comme callback de navigation (`onNavigate={go}`)
  // window.scrollTo(0,0) : sans vrai routeur, le navigateur ne remet jamais
  // le scroll en haut tout seul quand on change d'écran — on le force nous-mêmes.
  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  // Vérifie si l'utilisateur revient d'une connexion OAuth (Google)
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      console.log("✅ [AUTH] Token OAuth reçu et stocké avec succès !");
      // Nettoie l'URL sans recharger la page
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirige vers l'onboarding candidat ou le dashboard selon le mode
      setScreen(userMode === "candidate" ? "onboarding1" : "r-dashboard");
    }
  });

  // Prépare l'édition d'une mission : on mémorise LAQUELLE, puis on navigue.
  const handleEditMission = (m: Mission) => {
    setEditingMission(m);
    go("r-mission-edit");
  };

  // Remplace, dans la liste `missions`, celle dont l'id correspond à `updated`
  // (les autres restent inchangées) — c'est le seul endroit qui modifie `missions`.
  const handleSaveMission = (updated: Mission) => setMissions((p) => p.map((m) => (m.id === updated.id ? updated : m)));

  const isFormFlow = FORM_FLOW_SCREENS.includes(screen);

  // Le contenu à afficher est le même dans les deux cas — seul le
  // conteneur qui l'entoure change (voir le `return` plus bas).
  const activeScreen = (
    // `key={screen}` force React à remonter le composant à chaque
    // changement d'écran, ce qui relance l'animation .screen-enter
    // (voir index.css) à chaque navigation.
    <div key={screen} className="screen-enter">
      {screen === "role-select" && <RoleSelectScreen onNavigate={go} setUserMode={setUserMode} />}
      {screen === "auth" && <AuthScreen onNavigate={go} userMode={userMode} />}

      {/* Parcours candidat : inscription puis usage courant */}
      {screen === "onboarding1" && <Onboarding1Screen onNavigate={go} />}
      {screen === "cv-upload" && <CVUploadScreen onNavigate={go} />}
      {screen === "manual-entry" && <ManualEntryScreen onNavigate={go} />}
      {screen === "onboarding2" && <Onboarding2Screen onNavigate={go} />}
      {screen === "feed" && <FeedScreen onNavigate={go} setSelectedJob={setSelectedJob} />}
      {screen === "job-detail" && <JobDetailScreen job={selectedJob} onNavigate={go} />}
      {screen === "c-dashboard" && <CandidateDashboard onNavigate={go} />}

      {/* Parcours recruteur */}
      {screen === "r-dashboard" && <RecruiterDashboard onNavigate={go} missions={missions} onEditMission={handleEditMission} />}
      {screen === "r-create" && <MissionCreateScreen onNavigate={go} />}
      {screen === "r-mission-edit" && <MissionEditScreen mission={editingMission} onNavigate={go} onSave={handleSaveMission} />}
    </div>
  );

  // Écrans "app" (feed, dashboards...) : aucun conteneur, l'écran occupe
  // toute la fenêtre et gère lui-même sa mise en page responsive.
  if (!isFormFlow) return activeScreen;

  // Écrans "formulaire", sur grand écran (lg+) : vrai écran divisé en deux,
  // comme une page de connexion desktop classique (Slack, Stripe...) —
  // panneau de marque fixe à gauche, contenu du parcours à droite, centré
  // et plafonné en largeur (un formulaire étiré sur toute la largeur restante
  // serait aussi peu lisible qu'en pleine largeur d'écran).
  //
  // Sur mobile, ce panneau de gauche est simplement `hidden` : chaque écran
  // garde sa présentation d'origine en pleine largeur, avec son propre
  // bandeau/logo quand il en a un (voir les classes `lg:hidden` sur ces
  // bandeaux dans RoleSelectScreen et AuthScreen — sinon la marque
  // apparaîtrait deux fois sur grand écran : une fois ici, une fois dans
  // l'écran lui-même).
  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Panneau de marque : uniquement affiché à partir de lg (1024px),
          et "sticky" (reste visible) pendant que la partie droite défile. */}
      <div className="hidden lg:flex lg:w-[42%] lg:min-w-[380px] lg:max-w-[520px] lg:shrink-0 lg:h-screen lg:sticky lg:top-0 lg:flex-col lg:items-center lg:justify-center relative overflow-hidden bg-gradient-to-br from-secondary via-accent/20 to-muted">
        {/* Deux cercles flous purement décoratifs (mêmes que RoleSelectScreen) */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/8" />
        <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-accent/25" />
        <div className="relative flex flex-col items-center gap-4 text-center px-10">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            {/* Logo : deux têtes (candidat/recruteur) reliées par une flèche de mise en relation */}
            <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
              <circle cx="11" cy="11" r="5" stroke="#C4697B" strokeWidth="1.8" />
              <circle cx="11" cy="25" r="5" stroke="#C4697B" strokeWidth="1.8" />
              <path d="M15 15l12-4M15 21l12 4" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M15 15.5l3 2.5-3 2.5" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <AppName size="lg" />
          <p className="text-base text-muted-foreground max-w-[280px]">La plateforme qui connecte les talents de la coiffure aux salons qui les recherchent.</p>
        </div>
      </div>

      {/* Contenu du parcours : plein écran sur mobile (comportement inchangé),
          centré et plafonné en largeur sur grand écran. */}
      <div className="lg:flex-1 lg:flex lg:justify-center lg:overflow-y-auto lg:h-screen">
        <div className="w-full lg:max-w-md lg:px-10 lg:py-10">
          {activeScreen}
        </div>
      </div>
    </div>
  );
}

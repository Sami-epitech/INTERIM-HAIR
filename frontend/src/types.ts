// ════════════════════════════════════════════════════════════
// types.ts
// ────────────────────────────────────────────────────────────
// Tous les types partagés entre plusieurs écrans/composants.
// Centraliser ici évite les imports croisés entre écrans et
// donne une vue d'ensemble de "ce que l'app manipule".
// ════════════════════════════════════════════════════════════

/**
 * Chaque valeur correspond à un écran de l'application.
 * App.tsx garde le nom de l'écran courant dans un état React
 * (`useState<Screen>`) et affiche le composant correspondant —
 * c'est un routeur "fait maison", sans librairie de routing,
 * volontairement simple pour ce prototype.
 */
export type Screen =
  | "role-select"     // Choix "je suis intérimaire" / "je suis recruteur·se"
  | "auth"            // Connexion / Inscription
  | "onboarding1"     // Choix import CV vs saisie manuelle
  | "cv-upload"        // Import + relecture des données extraites du CV
  | "manual-entry"     // Saisie manuelle du profil candidat
  | "onboarding2"      // Préférences (compétences recherchées, zone, disponibilités)
  | "feed"             // Fil des offres (candidat)
  | "job-detail"        // Détail d'une offre + candidature
  | "c-dashboard"       // Espace candidat (candidatures / favoris / profil)
  | "r-dashboard"        // Espace recruteur (missions / candidat·e·s)
  | "r-create"            // Création d'une nouvelle mission
  | "r-mission-edit";      // Édition d'une mission existante

/** Le type de compte choisi à l'écran "role-select" */
export type UserMode = "candidate" | "recruiter";

/** Les deux onglets de l'écran d'authentification */
export type AuthTab = "login" | "signup";

/** Les onglets de l'espace candidat */
export type DashTab = "applications" | "favorites" | "profile";

/** Les onglets de l'espace recruteur */
export type RecTab = "missions" | "applicants";

/**
 * Une offre/mission telle qu'affichée dans le fil candidat
 * (voir frontend/src/data/mockData.ts → JOBS).
 * NB : ce type sera à terme remplacé par le contrat renvoyé par
 * l'API backend (GET /api/missions), voir backend/src/controllers/missions.controller.js
 */
export type Job = {
  id: number;
  title: string;
  salon: string;
  location: string;
  rate: number;
  shift: string;
  contract: string;
  match: number; // score de compatibilité IA, 0-100
  tags: string[];
  image: string;
  description: string;
  diplomas: string[];
  benefits: string[];
};

/**
 * Une mission telle que gérée côté recruteur (création/édition/suivi).
 * Différent de `Job` : ici on garde des dates structurées (sortDate,
 * startDate, endDate) pour pouvoir trier et éditer, alors que `Job`
 * n'a qu'un texte d'affichage ("shift").
 */
export type Mission = {
  id: number;
  title: string;
  dates: string;        // texte affiché, ex. "15 – 30 sept. 2026"
  sortDate: Date;        // date utilisée pour le tri chronologique
  startDate: string;      // format ISO (yyyy-mm-dd), pour les <input type="date">
  endDate: string;
  location: string;
  rate: number;
  shift: string;
  description: string;
  skills: string[];
  count: number;          // nombre de postes à pourvoir
  status: "open" | "filled" | "completed";
};

/** Un·e candidat·e ayant postulé à une mission (vue recruteur) */
export type Applicant = {
  id: number;
  missionId: number;
  name: string;
  match: number;
  level: string;
  status: string;
  initials: string;
  availFrom: string;
  availTo: string;
};

/** Une candidature telle qu'affichée dans l'espace candidat */
export type Application = {
  id: number;
  title: string;
  salon: string;
  date: string;
  status: string;
};

/** Filtres appliqués sur le fil d'offres (voir components/FilterModal.tsx) */
export type Filters = {
  contract: string;
  location: string;
  rateMin: number;
  matchMin: number;
};

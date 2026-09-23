/**
 * Écrans de navigation de l'application.
 */
export type Screen =
  | "role-select"
  | "auth"
  | "onboarding1"
  | "cv-upload"
  | "manual-entry"
  | "onboarding2"
  | "feed"
  | "job-detail"
  | "c-dashboard"
  | "r-dashboard"
  | "r-create"
  | "r-mission-edit";

/**
 * Rôles utilisateur dans l'application.
 */
export type UserMode = "candidate" | "recruiter";

/**
 * Onglets de l'écran d'authentification.
 */
export type AuthTab = "login" | "signup";

/**
 * Onglets du tableau de bord candidat.
 */
export type DashTab = "applications" | "favorites" | "profile";

/**
 * Onglets du tableau de bord recruteur.
 */
export type RecTab = "missions" | "applicants";

/**
 * Modèle unifié d'une offre d'emploi / mission présentée au candidat.
 */
export type Job = {
  id: number | string;
  title: string;
  salon: string;
  location: string;
  rate: number;
  shift: string;
  contract: string;
  match: number;
  tags: string[];
  skills?: string[];
  image: string;
  description: string;
  dates?: string;
  sortDate?: Date | string;
  diplomas?: string[];
  benefits?: string[];
  urlOrigine?: string;
  isInternal?: boolean;
  recruiterEmail?: string;
};

/**
 * Mission créée ou gérée par un recruteur.
 */
export type Mission = {
  id: number | string;
  title: string;
  dates: string;
  sortDate?: Date | string;
  startDate?: string;
  endDate?: string;
  location: string;
  rate: number;
  shift: string;
  description: string;
  skills: string[];
  count?: number;
  status: "open" | "filled" | "completed" | "closed" | "paused" | string;
};

/**
 * Candidat ayant postulé à une mission côté recruteur.
 */
export type Applicant = {
  id: number | string;
  missionId: number | string;
  name: string;
  match: number;
  level: string;
  status: string;
  initials: string;
  availFrom: string;
  availTo: string;
};

/**
 * Candidature suivie côté candidat.
 */
export type Application = {
  id: number | string;
  title: string;
  salon: string;
  date: string;
  status: string;
};

/**
 * Critères de filtrage des offres sur le fil d'actualité.
 */
export type Filters = {
  contract: string;
  location: string;
  rateMin: number;
  matchMin: number;
};
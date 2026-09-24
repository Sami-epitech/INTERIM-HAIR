/**
 * Bibliothèque d'icônes SVG vectorielles de l'application.
 */

/** Cœur (favoris) — rempli en rose quand `filled` est vrai */
export const IHeart = ({ filled, className = "" }: { filled?: boolean; className?: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill={filled ? "#E11D48" : "none"}
    stroke={filled ? "#E11D48" : "currentColor"}
    className={`${filled ? "text-rose-600" : "text-current"} ${className}`}
  >
    <path
      d="M11 19.5S2.5 14 2.5 7.5a4.5 4.5 0 0 1 8.5-2.1A4.5 4.5 0 0 1 19.5 7.5C19.5 14 11 19.5 11 19.5Z"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Mallette (onglet "Offres" / "Candidatures") */
export const IBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="7" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 11h16" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/** Étoile (onglet "Favoris") */
export const IStar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2l2.4 5.1 5.6.5-4.1 3.8 1.2 5.5L10 14.2l-5.1 2.7 1.2-5.5L2 7.6l5.6-.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/** Silhouette (onglet "Profil") */
export const IUser = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Flèche droite (boutons "voir plus", cartes cliquables) */
export const IArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Marqueur de localisation */
export const ILocation = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
    <path d="M7 1.5a4 4 0 0 1 4 4c0 2.5-4 7-4 7S3 8 3 5.5a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="7" cy="5.5" r="1.2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/** Horloge (horaires) */
export const IClock = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/** Flèche vers le haut dans un cadre (import de fichier — CV, fiche de poste) */
export const IUpload = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M14 20V12m0 0-4 4m4-4 4 4" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 22h12a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4Z" stroke="#C4697B" strokeWidth="1.8" />
  </svg>
);

/** Stylo + feuille (saisie manuelle) */
export const IEdit = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 22l4.5-1.5L22 7a2.1 2.1 0 0 0-3-3L5.5 17.5 4 22Z" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 4l3 3" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** Plus (bouton "Nouveau" — créer une mission) */
export const IPlus = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/** Poubelle (rejeter un·e candidat·e) */
export const ITrash = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/** Filtre (bouton "Filtres" du fil d'offres) */
export const IFilter = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Calendrier (dates de disponibilité / de mission) */
export const ICalendar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 1v3M9 1v3M1.5 6h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/** Chevron bas (déplier/replier une liste de candidat·e·s) */
export const IChevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Petit crayon (éditer un champ précis, ex. relecture de CV) */
export const IPencil = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 12l2.5-1L12 4a1.4 1.4 0 0 0-2-2L2.5 9.5 2 12Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 2.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/** Coche (validation, succès) */
export const ICheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Croix (fermer une modale, retirer un tag) */
export const IX = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Déconnexion (logout) */
export const ILogout = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

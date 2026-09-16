// ════════════════════════════════════════════════════════════
// utils/format.ts — petites fonctions de formatage réutilisées
// ════════════════════════════════════════════════════════════

/**
 * Formate une date ISO ("2026-09-15") en texte lisible français
 * ("15 septembre 2026"). Renvoie un tiret cadratin si la date est
 * vide (champ pas encore rempli).
 */
export const formatDate = (d: string): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

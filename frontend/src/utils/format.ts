/**
 * Fonctions utilitaires de formatage des données pour l'interface utilisateur.
 */

/**
 * Formate une chaîne de date ISO en format textuel français (ex: 15 sept. 2026).
 *
 * @param d - Chaîne de date source.
 * @returns Date formatée en français ou tiret cadratin si absente.
 */
export const formatDate = (d: string): string => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};


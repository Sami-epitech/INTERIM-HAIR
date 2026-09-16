// ════════════════════════════════════════════════════════════
// components/ui/StatusBadge.tsx
// ────────────────────────────────────────────────────────────
// Petite pastille colorée affichant un statut (candidature,
// mission...). Une seule source de vérité (`statusMap`) pour que
// la couleur d'un statut donné soit toujours la même, partout
// dans l'app.
// ════════════════════════════════════════════════════════════

/**
 * Associe chaque statut technique (clé, ex. "interview") à :
 *  - label : le texte affiché en français
 *  - bg/text/dot : les classes Tailwind de couleur (fond, texte, puce)
 *
 * Pour ajouter un nouveau statut : ajouter une entrée ici, rien
 * d'autre à modifier ailleurs dans le code.
 */
const statusMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  submitted: { label: "Soumise", bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-400" },
  review: { label: "En cours", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  interview: { label: "Entretien", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  rejected: { label: "Refusée", bg: "bg-red-50", text: "text-red-400", dot: "bg-red-300" },
  open: { label: "Ouverte", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  filled: { label: "Pourvue", bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-400" },
  completed: { label: "Terminée", bg: "bg-neutral-100", text: "text-neutral-500", dot: "bg-neutral-400" },
  pending: { label: "En attente", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  shortlisted: { label: "Sélectionné·e", bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  // Si le statut reçu n'est pas dans la table (donnée corrompue, nouveau
  // statut pas encore géré ici...), on retombe sur "pending" plutôt que
  // de planter l'affichage.
  const cfg = statusMap[status] ?? statusMap.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

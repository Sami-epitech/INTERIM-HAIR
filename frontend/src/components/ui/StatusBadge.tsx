/**
 * Badge visuel indiquant l'état d'avancement d'une candidature ou d'une mission.
 */

/**
 * Correspondance entre statuts techniques et propriétés visuelles (libellé, couleurs).
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
  // Statut par défaut si non répertorié
  const cfg = statusMap[status] ?? statusMap.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

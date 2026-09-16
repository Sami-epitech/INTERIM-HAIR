// ════════════════════════════════════════════════════════════
// components/ui/BackBtn.tsx — bouton rond "retour" (flèche gauche)
// ────────────────────────────────────────────────────────────
// Ne connaît pas la navigation elle-même : reçoit juste un callback
// onClick, appelé par chaque écran avec `() => onNavigate("écran-précédent")`.
// ════════════════════════════════════════════════════════════
export const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-150 shrink-0"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

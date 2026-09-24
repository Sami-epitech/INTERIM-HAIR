/**
 * Bouton d'action retour avec icône de flèche vers la gauche.
 */
export const BackBtn = ({
  onClick,
  disabled = false,
  title = "Retour",
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    title={title}
    className={`flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card transition-all duration-150 shrink-0 ${
      disabled
        ? "opacity-40 cursor-not-allowed text-muted-foreground/60"
        : "text-muted-foreground hover:text-foreground hover:border-foreground/20 cursor-pointer shadow-xs"
    } ${className}`}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

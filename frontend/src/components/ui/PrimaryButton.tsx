// ════════════════════════════════════════════════════════════
// components/ui/PrimaryButton.tsx
// ────────────────────────────────────────────────────────────
// LE bouton d'action principal de l'app (fond rose "primary").
// Utilisé pour toutes les actions "suivantes" (Continuer, Se
// connecter, Confirmer ma candidature...). `disabled` grise le
// bouton et bloque le clic — utilisé pour empêcher de continuer
// tant qu'un formulaire n'est pas valide.
// ════════════════════════════════════════════════════════════
import type { ReactNode } from "react";

export const PrimaryButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

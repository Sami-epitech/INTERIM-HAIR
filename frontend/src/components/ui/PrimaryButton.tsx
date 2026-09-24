/**
 * Bouton d'action principal de l'application.
 */
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
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

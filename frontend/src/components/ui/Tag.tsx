/**
 * Étiquette compacte pour l'affichage de compétences ou d'attributs.
 */
import type { ReactNode } from "react";


export const Tag = ({ children }: { children: ReactNode }) => (
  <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/60">
    {children}
  </span>
);

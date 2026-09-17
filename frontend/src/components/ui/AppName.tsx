// ════════════════════════════════════════════════════════════
// components/ui/AppName.tsx — logo texte "Interim'hair"
// ────────────────────────────────────────────────────────────
// L'apostrophe est mise en rose (text-primary) pour un petit
// détail de marque, répété sur tous les écrans qui affichent le nom.
// size="lg" pour l'écran d'accueil, size="sm" en en-tête des autres écrans.
// ════════════════════════════════════════════════════════════
export const AppName = ({ size = "lg" }: { size?: "sm" | "lg" }) => (
  <span className={`font-serif ${size === "lg" ? "text-4xl" : "text-xl"} text-foreground tracking-tight`}>
    Interim<span className="text-primary">'</span>hair
  </span>
);

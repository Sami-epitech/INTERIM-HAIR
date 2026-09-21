// ════════════════════════════════════════════════════════════
// components/ui/AppName.tsx — logo "Interim'hair"
// ────────────────────────────────────────────────────────────
// TK-017 : remplace le logo texte par le vrai logo (image) créé
// pour la marque. `size="lg"` pour l'écran d'accueil, `size="sm"`
// en en-tête des autres écrans.
// ════════════════════════════════════════════════════════════
import logo from "../../assets/logo_site.svg";

export const AppName = ({ size = "lg" }: { size?: "sm" | "lg" }) => (
  <img
    src={logo}
    alt="Interim'hair"
    className={size === "lg" ? "h-24 w-auto" : "h-9 w-auto"}
  />
);
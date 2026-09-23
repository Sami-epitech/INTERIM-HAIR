/**
 * Composant d'affichage du logo officiel Interim'hair.
 */
import logo from "../../assets/logo_site.svg";


export const AppName = ({ size = "lg" }: { size?: "sm" | "lg" }) => (
  <img
    src={logo}
    alt="Interim'hair"
    className={size === "lg" ? "h-24 w-auto" : "h-9 w-auto"}
  />
);
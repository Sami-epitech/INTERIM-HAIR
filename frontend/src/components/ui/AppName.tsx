/**
 * Composant d'affichage du logo officiel Interim'hair.
 */
import logo from "../../assets/logo_site.svg";

export const AppName = ({
  size = "lg",
  variant = "auto",
  className = "",
}: {
  size?: "sm" | "lg";
  variant?: "dark" | "light" | "auto";
  className?: string;
}) => {
  const sizeClass = size === "lg" ? "h-24 w-auto" : "h-9 w-auto";
  const variantClass = variant === "light" ? "brightness-0 invert drop-shadow-md" : "";

  return (
    <img
      src={logo}
      alt="Interim'hair"
      className={`${sizeClass} ${variantClass} ${className}`}
    />
  );
};
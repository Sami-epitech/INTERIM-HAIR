// ════════════════════════════════════════════════════════════
// components/candidate/BottomNav.tsx
// ────────────────────────────────────────────────────────────
// Barre de navigation basse de l'espace candidat (3 onglets).
// "Favoris" et "Profil" renvoient tous deux vers "c-dashboard" :
// c'est CandidateDashboard qui gère ensuite l'onglet interne
// actif (voir son prop `tab` / `DashTab`). Seul "Offres" a son
// propre écran plein (le feed).
//
// Réservée au MOBILE (classe "lg:hidden") : à partir de lg (1024px),
// c'est Sidebar.tsx qui prend le relais avec la même logique de
// navigation, affichée sur le côté plutôt qu'en bas.
// ════════════════════════════════════════════════════════════
import type { DashTab, Screen } from "../../types";
import { IBriefcase, IStar, IUser } from "../icons";

export function BottomNav({
  active,
  onNavigate,
  onTabChange,
}: {
  active: string;
  onNavigate: (s: Screen) => void;
  onTabChange?: (tab: DashTab) => void;
}) {
  const items: { key: string; label: string; icon: any; s: Screen; tab?: DashTab }[] = [
    { key: "feed", label: "Offres", icon: <IBriefcase />, s: "feed" },
    { key: "favorites", label: "Favoris", icon: <IStar />, s: "c-dashboard", tab: "favorites" },
    { key: "profile", label: "Profil", icon: <IUser />, s: "c-dashboard", tab: "profile" },
  ];

  const handleItemClick = (item: (typeof items)[0]) => {
    if (item.tab && onTabChange) {
      onTabChange(item.tab);
    }
    onNavigate(item.s);
  };

  return (
    <div className="lg:hidden border-t border-border bg-card px-6 pt-3 pb-7 flex justify-around">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => handleItemClick(item)}
          className={`flex flex-col items-center gap-1 transition-colors duration-150 ${active === item.key ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          {item.icon}
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

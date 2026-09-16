// ════════════════════════════════════════════════════════════
// components/candidate/Sidebar.tsx
// ────────────────────────────────────────────────────────────
// Navigation latérale affichée UNIQUEMENT sur grand écran (lg+,
// 1024px et plus) — remplace la BottomNav, qui elle reste
// réservée au mobile (voir BottomNav.tsx, classe lg:hidden).
//
// Un composant séparé plutôt qu'un seul "NavUniverselle" avec
// plein de classes conditionnelles : la disposition (colonne à
// gauche vs barre en bas) est trop différente pour partager le
// même JSX proprement, mais la LOGIQUE (les 3 mêmes destinations)
// reste identique entre les deux — à garder synchronisée si un
// jour un 4e onglet est ajouté.
// ════════════════════════════════════════════════════════════
import type { Screen } from "../../types";
import { AppName } from "../ui";
import { IBriefcase, IStar, IUser } from "../icons";

export function Sidebar({ active, onNavigate }: { active: string; onNavigate: (s: Screen) => void }) {
  const items = [
    { key: "feed", label: "Offres", icon: <IBriefcase />, s: "feed" as Screen },
    { key: "favorites", label: "Favoris", icon: <IStar />, s: "c-dashboard" as Screen },
    { key: "profile", label: "Profil", icon: <IUser />, s: "c-dashboard" as Screen },
  ];

  return (
    // "hidden" par défaut (mobile/tablette) → redevient visible en colonne
    // à partir de lg. "sticky top-0" : reste visible même quand le contenu
    // principal défile, comme une vraie barre latérale d'application.
    <div className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 lg:border-r lg:border-border lg:py-8 lg:px-5 lg:gap-8">
      <div className="px-2"><AppName size="sm" /></div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.s)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
              active === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

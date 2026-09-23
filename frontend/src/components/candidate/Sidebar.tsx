/**
 * Barre de navigation latérale pour écrans larges (desktop).
 */
import type { DashTab, Screen } from "../../types";
import { AppName } from "../ui";
import { IBriefcase, ILogout, IStar, IUser } from "../icons";

export function Sidebar({
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

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userId");
    onNavigate("role-select");
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 lg:border-r lg:border-border lg:py-8 lg:px-5 lg:gap-8">
      <div className="px-2"><AppName size="sm" /></div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => handleItemClick(item)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
              active === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left"
        >
          <ILogout />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

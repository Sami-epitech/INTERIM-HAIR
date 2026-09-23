/**
 * Écran d'accueil et de sélection du profil d'utilisation (intérimaire ou recruteur).
 */
import { useEffect, useState } from "react";
import type { Screen, UserMode } from "../../types";
import { AppName } from "../../components/ui";
import { IArrow } from "../../components/icons";

const KEY_STATS = [
  { value: 500, suffix: "+", label: "missions actives" },
  { value: 1200, suffix: "+", label: "coiffeurs inscrits" },
  { value: 50, suffix: "+", label: "salons partenaires" },
];

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function StatItem({ value, suffix, label, index }: { value: number; suffix: string; label: string; index: number }) {
  const count = useCountUp(value);
  return (
    <div
      className="flex flex-col items-center text-center stat-fade-in"
      style={{ animationDelay: `${0.3 + index * 0.15}s` }}
    >
      <span className="font-serif text-4xl lg:text-5xl text-foreground font-medium">{count}{suffix}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export function RoleSelectScreen({
  onNavigate,
  setUserMode,
}: {
  onNavigate: (s: Screen) => void;
  setUserMode: (m: UserMode) => void;
}) {
  const choose = (m: UserMode) => {
    setUserMode(m);
    onNavigate("auth");
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="lg:hidden relative overflow-hidden bg-gradient-to-br from-secondary via-accent/20 to-muted h-36 flex flex-col items-center justify-center">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/8" />
        <div className="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-accent/25" />
        <div className="relative flex flex-col items-center gap-3">
          <AppName size="lg" />
          <p className="text-sm text-muted-foreground">La plateforme des talents de la coiffure</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 lg:pt-16 pb-6 gap-3">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-foreground">Bienvenue !</h1>
          <p className="text-sm text-muted-foreground mt-2">Qui êtes-vous ? Choisissez votre profil pour continuer.</p>
        </div>

        <div className="flex flex-col gap-3 flex-1 justify-center">
          {[
            {
              mode: "candidate" as UserMode,
              title: "Je suis intérimaire",
              desc: "Coiffeur·se, coloriste, visagiste — trouvez les meilleures missions près de chez vous.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="10" r="5" stroke="#C4697B" strokeWidth="1.8" />
                  <path d="M5 27c0-5 4.9-9 11-9s11 4 11 9" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              mode: "recruiter" as UserMode,
              title: "Je suis recruteur·se",
              desc: "Salon, école, réseau — publiez vos missions et trouvez les meilleurs profils.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="12" width="24" height="16" rx="3" stroke="#C4697B" strokeWidth="1.8" />
                  <path d="M20 12V9a4 4 0 0 0-8 0v3" stroke="#C4697B" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 18h24" stroke="#C4697B" strokeWidth="1.8" />
                  <circle cx="16" cy="22" r="2" stroke="#C4697B" strokeWidth="1.8" />
                </svg>
              ),
            },
          ].map((opt) => (
            <button
              key={opt.mode}
              onClick={() => choose(opt.mode)}
              className="group flex items-center gap-5 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-accent/40 flex items-center justify-center shrink-0">
                {opt.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-foreground">{opt.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                <IArrow />
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-around py-5 border-t border-border">
          {KEY_STATS.map((stat, i) => (
            <StatItem key={stat.label} {...stat} index={i} />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos{" "}
          <button
            type="button"
            onClick={() => onNavigate("legal")}
            className="text-primary font-medium underline underline-offset-2"
          >
            Conditions d'utilisation
          </button>
        </p>
      </div>
    </div>
  );
}
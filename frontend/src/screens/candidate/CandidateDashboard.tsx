// ════════════════════════════════════════════════════════════
// screens/candidate/CandidateDashboard.tsx
// ────────────────────────────────────────────────────────────
// Espace candidat : 3 onglets internes (Candidatures / Favoris /
// Profil), gérés par un état local `tab` — pas besoin de 3 écrans
// séparés dans `Screen` puisqu'on reste toujours sur "c-dashboard"
// en naviguant entre ces onglets.
//
// TODO backend :
//  - onglet "Candidatures" → GET /api/applications/me
//  - onglet "Favoris"      → GET /api/users/me/favorites (à créer)
//  - onglet "Profil"       → GET /api/users/me
// ════════════════════════════════════════════════════════════
import { useState, type ReactNode } from "react";
import type { DashTab, Screen } from "../../types";
import { APPLICATIONS, DAYS, FAVORITES_DATA } from "../../data/mockData";
import { BackBtn, MatchRing, StatusBadge, Tag } from "../../components/ui";
import { IBriefcase, ICalendar, IClock, IPencil, IStar, IUser } from "../../components/icons";
import { BottomNav } from "../../components/candidate/BottomNav";
import { Sidebar } from "../../components/candidate/Sidebar";

export function CandidateDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [tab, setTab] = useState<DashTab>("applications");

  const TABS: { key: DashTab; label: string; icon: ReactNode }[] = [
    { key: "applications", label: "Candidatures", icon: <IBriefcase /> },
    { key: "favorites", label: "Favoris", icon: <IStar /> },
    { key: "profile", label: "Profil", icon: <IUser /> },
  ];

  // Même règle que BottomNav : "applications" met en avant "feed" dans
  // la nav (car il n'y a pas d'onglet "candidatures" dédié côté nav globale).
  const navActive = tab === "applications" ? "feed" : tab === "favorites" ? "favorites" : "profile";

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar active={navActive} onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 lg:px-8 pt-12 lg:pt-8 pb-5 flex items-center gap-3">
          <BackBtn onClick={() => onNavigate("feed")} />
          <div>
            <h1 className="font-serif text-2xl text-foreground">Mon espace</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Marie Dupont · Coloriste Expert</p>
          </div>
        </div>

        {/* Onglets — scroll horizontal si jamais ça déborde sur petit écran, sans scrollbar visible */}
        <div className="px-5 lg:px-8 border-b border-border flex gap-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 pb-3 text-sm font-medium shrink-0 border-b-2 -mb-px transition-colors duration-150 ${tab === t.key ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 lg:px-8 py-5">
          {/* max-w-6xl : évite que le contenu s'étire de façon inconfortable
              sur un très large écran, tout en profitant de la place libérée
              par la Sidebar pour passer les listes en grille. */}
          <div className="max-w-6xl mx-auto w-full">
            {/* ── Onglet Candidatures ─────────────────────────────── */}
            {tab === "applications" && (
              <div className="flex flex-col gap-3 lg:max-w-2xl">
                {APPLICATIONS.map((app) => (
                  <div key={app.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="6" width="14" height="10" rx="2" stroke="#C4697B" strokeWidth="1.4" />
                        <path d="M11 6V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2" stroke="#C4697B" strokeWidth="1.4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{app.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.salon} · {app.date}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Onglet Favoris ──────────────────────────────────── */}
            {tab === "favorites" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {FAVORITES_DATA.map((job) => (
                  <div key={job.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="h-28 bg-muted overflow-hidden"><img src={job.image} alt={job.salon} className="w-full h-full object-cover" /></div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.salon} · {job.location}</p>
                        </div>
                        <MatchRing score={job.match} size={40} />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-serif text-lg text-foreground">{job.rate}€<span className="text-xs text-muted-foreground font-sans">/h</span></span>
                        {/* Renvoie simplement vers le fil (pas de deep-link direct vers job-detail
                            depuis ici pour rester simple — à améliorer si besoin plus tard) */}
                        <button onClick={() => onNavigate("feed")} className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">Voir l'offre</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Onglet Profil ───────────────────────────────────── */}
            {tab === "profile" && (
              <div className="flex flex-col gap-5">
                <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-serif text-xl">MD</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Marie Dupont</p>
                    <p className="text-sm text-muted-foreground">Coloriste · Expert</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paris, 25 km</p>
                  </div>
                  <button className="text-primary"><IPencil /></button>
                </div>

                {/* Compétences + Disponibilités côte à côte à partir de lg,
                    au lieu d'être empilées comme sur mobile. */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5">
                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm font-semibold text-foreground mb-3">Compétences</p>
                    <div className="flex flex-wrap gap-2">{["CAP Coiffure", "Coloriste", "Balayage", "Visagisme", "Kératine"].map((s) => <Tag key={s}>{s}</Tag>)}</div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm font-semibold text-foreground mb-3">Disponibilités</p>
                    <div className="flex items-center gap-2 mb-3"><ICalendar /><span className="text-xs text-foreground font-medium">15 sept. 2026 → 31 déc. 2026</span></div>
                    <div className="flex gap-1.5 mb-3">
                      {DAYS.map((d) => (
                        <div key={d} className={`flex-1 py-2 rounded-lg text-xs font-medium text-center ${["Lun", "Mar", "Mer", "Jeu", "Ven"].includes(d) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{d}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2"><IClock /><span className="text-xs text-muted-foreground">9h – 18h</span></div>
                  </div>
                </div>

                {/* Petites statistiques récapitulatives — calculées côté backend à terme */}
                <div className="grid grid-cols-3 lg:max-w-2xl gap-3">
                  {[{ label: "Candidatures", value: "4" }, { label: "Entretiens", value: "1" }, { label: "Score moyen", value: "82%" }].map((s) => (
                    <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
                      <p className="font-serif text-2xl text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* L'onglet actif de BottomNav doit refléter l'onglet interne courant */}
        <BottomNav active={navActive} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

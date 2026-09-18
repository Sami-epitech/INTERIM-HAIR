// ════════════════════════════════════════════════════════════
// screens/candidate/FeedScreen.tsx
// ────────────────────────────────────────────────────────────
// Fil des offres proposées au candidat. Comprend la recherche par
// filtres (via FilterModal) et la gestion des favoris (cœur sur
// chaque carte). C'est le "hub" principal du côté candidat.
//
// TODO backend : remplacer `JOBS` (données mockées) par un fetch
// vers GET /api/missions avec les filtres en query string — voir
// backend/src/controllers/missions.controller.js → listMissions().
// ════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import type { Filters, Job, Screen } from "../../types";
import { JOBS } from "../../data/mockData";
import { AppName, BackBtn, MatchRing, Tag } from "../../components/ui";
import { IArrow, IClock, IFilter, IHeart, ILocation } from "../../components/icons";
import { FilterModal } from "../../components/candidate/FilterModal";
import { BottomNav } from "../../components/candidate/BottomNav";
import { Sidebar } from "../../components/candidate/Sidebar";

const DEFAULT_FILTERS: Filters = { contract: "Tous", location: "", rateMin: 10, matchMin: 0 };

export function FeedScreen({ onNavigate, setSelectedJob }: { onNavigate: (s: Screen) => void; setSelectedJob: (j: Job) => void }) {
  // Favoris pré-rempli avec l'offre id=1, pour illustrer l'état "déjà favori" au chargement
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFav = (id: number) => setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // `useMemo` : on ne refiltre la liste que si `filters` change, pas à
  // chaque re-render du composant (ex. quand on ouvre/ferme la modale).
  const filtered = useMemo(
    () =>
      JOBS.filter((j) => {
        if (filters.contract !== "Tous" && j.contract !== filters.contract) return false;
        if (filters.location && !j.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (j.rate < filters.rateMin) return false;
        if (j.match < filters.matchMin) return false;
        return true;
      }),
    [filters],
  );

  // Nombre de filtres actifs (différents de leur valeur par défaut) — affiché en pastille sur le bouton "Filtres"
  const activeCount = [filters.contract !== "Tous", filters.location !== "", filters.rateMin > 10, filters.matchMin > 0].filter(Boolean).length;

  return (
    // lg:flex-row : à partir de 1024px, la Sidebar (colonne fixe) et le
    // contenu principal se placent côte à côte au lieu de s'empiler.
    <div className="h-screen overflow-hidden bg-background flex flex-col lg:flex-row">
      {showFilters && <FilterModal filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}

      <Sidebar active="feed" onNavigate={onNavigate} />

      {/* min-w-0 : essentiel dans un enfant flex pour que son contenu
          (la grille de cartes) puisse rétrécir sous sa largeur naturelle
          plutôt que de forcer la Sidebar à sortir de l'écran. */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="px-5 lg:px-8 pt-12 lg:pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackBtn onClick={() => onNavigate("role-select")} />
            <div>
              {/* Le logo n'a plus besoin d'être répété ici sur desktop : il
                  est déjà affiché en haut de la Sidebar. On le garde quand
                  même visible en permanence (masqué uniquement à lg) pour
                  ne pas casser l'en-tête mobile. */}
              <div className="lg:hidden"><AppName size="sm" /></div>
              <p className="text-xs text-muted-foreground mt-0.5 lg:mt-0 lg:text-sm">Paris & alentours · {filtered.length} offres</p>
            </div>
          </div>
          {/* Avatar (initiales) → accès rapide à l'espace candidat */}
          <button onClick={() => onNavigate("c-dashboard")} className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent/40 border border-border">
            <span className="text-xs font-semibold text-foreground">MD</span>
          </button>
        </div>

        {/* Ligne du bouton Filtres + compteur + "tout effacer" si des filtres sont actifs */}
        <div className="px-5 lg:px-8 pb-3 flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${activeCount > 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}
          >
            <IFilter />
            Filtres
            {activeCount > 0 && <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">{activeCount}</span>}
          </button>
          {activeCount > 0 && (
            <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              Tout effacer
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 lg:px-8 pb-4">
          {/* max-w-6xl mx-auto : sur très grand écran, la grille ne s'étire
              pas à l'infini — elle reste à une largeur confortable à lire. */}
          <div className="max-w-6xl mx-auto w-full">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-muted-foreground text-sm">Aucune offre pour ces filtres</p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-primary text-sm font-medium underline underline-offset-2">Réinitialiser</button>
              </div>
            ) : (
              // 1 colonne sur mobile, 2 à partir de lg (place libérée par la
              // Sidebar), 3 à partir de xl (très grand écran).
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((job) => (
                  <div key={job.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Bandeau photo : dégradé sombre en bas pour la lisibilité du badge contrat,
                        score IA affiché en haut à droite via MatchRing */}
                    <div className="relative h-40 bg-muted overflow-hidden">
                      <img src={job.image} alt={job.salon} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                        <MatchRing score={job.match} size={48} />
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground">{job.contract}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-base text-foreground leading-tight">{job.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.salon}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><ILocation />{job.location}</span>
                        <span className="flex items-center gap-1"><IClock />{job.shift}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">{job.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-2xl text-foreground">{job.rate}€</span>
                          <span className="text-xs text-muted-foreground">/h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleFav(job.id)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary transition-colors">
                            <IHeart filled={favorites.includes(job.id)} />
                          </button>
                          <button
                            onClick={() => { setSelectedJob(job); onNavigate("job-detail"); }}
                            className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            Postuler <IArrow />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <BottomNav active="feed" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

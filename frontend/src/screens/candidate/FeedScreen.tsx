// ════════════════════════════════════════════════════════════
// screens/candidate/FeedScreen.tsx
// ────────────────────────────────────────────────────────────
// Fil des offres proposées au candidat.
// Connecté au Back-End Node.js (GET http://localhost:8000/api/jobs)
// ════════════════════════════════════════════════════════════
import { useMemo, useState, useEffect } from "react";
import type { Filters, Job, Screen } from "../../types";
import { MatchRing, Tag } from "../../components/ui";
import { IArrow, IClock, IFilter, IHeart, ILocation } from "../../components/icons";
import { AppName } from "../../components/ui";
import { FilterModal } from "../../components/candidate/FilterModal";
import { BottomNav } from "../../components/candidate/BottomNav";
import { Sidebar } from "../../components/candidate/Sidebar";

const DEFAULT_FILTERS: Filters = { contract: "Tous", location: "", rateMin: 10, matchMin: 0 };

export function FeedScreen({ onNavigate, setSelectedJob }: { onNavigate: (s: Screen) => void; setSelectedJob: (j: Job) => void }) {
  // État local pour stocker les offres provenant de l'API Node.js
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Favoris pré-remplis
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // 1. Récupération des offres depuis le Back-End Node.js
  useEffect(() => {
    fetch("http://localhost:8000/api/jobs")
      .then((res) => res.json())
      .then((data: Array<Record<string, any>>) => {
        // Adaptation des données reçues du Back-End au type `Job` strict du Front
        const formattedJobs: Job[] = data.map((item, index) => {
          const parsedRate = parseFloat(item.hourlyRate) || 12.5;

          return {
            id: Number(item.id) || index + 1,
            title: item.title || "Offre sans titre",
            salon: item.salonName || "Salon de coiffure",
            location: item.location || "Non précisé",
            contract: item.contractType || "Intérim",
            shift: "Journée",
            rate: parsedRate,
            match: 85 + (index % 10),
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            tags: Array.isArray(item.requirements) && item.requirements.length > 0 ? item.requirements : ["Polyvalence"],
            description: item.description || "Aucune description fournie.",
            // Ajout des propriétés requises par l'interface Job
            diplomas: item.diplomas || ["CAP Coiffure"],
            benefits: item.benefits || ["Titre-restaurant", "Mutuelle"],
          };
        });

        setJobsList(formattedJobs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de connexion au serveur Node.js :", err);
        setLoading(false);
      });
  }, []);

  const toggleFav = (id: string | number) => setFavorites((p) => (p.includes(String(id)) ? p.filter((x) => x !== String(id)) : [...p, String(id)]));

  // 2. Filtrage dynamique sur la liste récupérée du Back-End
  const filtered = useMemo(
    () =>
      jobsList.filter((j) => {
        if (filters.contract !== "Tous" && j.contract !== filters.contract) return false;
        if (filters.location && !j.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (j.rate < filters.rateMin) return false;
        if (j.match < filters.matchMin) return false;
        return true;
      }),
    [jobsList, filters],
  );

  const activeCount = [filters.contract !== "Tous", filters.location !== "", filters.rateMin > 10, filters.matchMin > 0].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Chargement des offres en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {showFilters && <FilterModal filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}

      <Sidebar active="feed" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 lg:px-8 pt-12 lg:pt-8 pb-4 flex items-center justify-between">
          <div>
            <div className="lg:hidden"><AppName size="sm" /></div>
            <p className="text-xs text-muted-foreground mt-0.5 lg:mt-0 lg:text-sm">Offres disponibles · {filtered.length} offres</p>
          </div>
          <button onClick={() => onNavigate("c-dashboard")} className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent/40 border border-border">
            <span className="text-xs font-semibold text-foreground">MD</span>
          </button>
        </div>

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
          <div className="max-w-6xl mx-auto w-full">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-muted-foreground text-sm">Aucune offre disponible pour le moment</p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-primary text-sm font-medium underline underline-offset-2">Réinitialiser les filtres</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((job) => (
                  <div key={job.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
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
                            <IHeart filled={favorites.includes(String(job.id))} />
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
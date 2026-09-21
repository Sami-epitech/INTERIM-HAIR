import { useEffect, useMemo, useState } from "react";
import type { DashTab, Filters, Job, Screen } from "../../types";
import { JOBS } from "../../data/mockData";
import { AppName, BackBtn, MatchRing, Tag } from "../../components/ui";
import { IArrow, IClock, IFilter, IHeart, ILocation } from "../../components/icons";
import { FilterModal } from "../../components/candidate/FilterModal";
import { BottomNav } from "../../components/candidate/BottomNav";
import { Sidebar } from "../../components/candidate/Sidebar";

const DEFAULT_FILTERS: Filters = { contract: "Tous", location: "", rateMin: 10, matchMin: 0 };

export function FeedScreen({
  onNavigate,
  setSelectedJob,
  favorites = [],
  onToggleFavorite,
  onNavigateToTab,
}: {
  onNavigate: (s: Screen) => void;
  setSelectedJob: (j: Job) => void;
  favorites?: (number | string)[];
  onToggleFavorite?: (job: Job) => void;
  onNavigateToTab?: (tab: DashTab) => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Récupération des offres (Airtable + France Travail) depuis l'API Express Back-End
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId");

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = userId
      ? `http://localhost:8000/api/jobs?candidateId=${encodeURIComponent(userId)}`
      : "http://localhost:8000/api/jobs";

    fetch(url, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau API");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalisation sécurisée des objets reçus depuis le backend
          const formattedJobs: Job[] = data.map((item: any, idx: number) => ({
            id: item.id || `job-ft-${idx}`,
            title: item.title || item.intitule || "Mission sans titre",
            salon: item.salon || (item.entreprise ? item.entreprise.nom : "Salon Partenaire"),
            location: item.location || (item.lieuTravail ? item.lieuTravail.libelle : "Localisation non précisée"),
            contract: item.contract || item.typeContratLibelle || "Intérim",
            rate: Number(item.rate || 15),
            shift: item.shift || "09:00 - 18:00",
            tags: item.tags || item.skills || ["Coiffure"],
            skills: item.skills || item.tags || [],
            match: item.match || 80,
            image: item.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
            description: item.description || "",
            dates: item.dates || "Dates à convenir",
            diplomas: item.diplomas || ["CAP Coiffure"],
            benefits: item.benefits || ["Mutuelle"],
          }));

          console.log(`✅ [FRONTEND CANDIDAT] ${formattedJobs.length} offres chargées (Airtable + France Travail)`);
          setJobs(formattedJobs);
        } else {
          setJobs(JOBS);
        }
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des offres :", err);
        setJobs(JOBS);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFav = (job: Job) => {
    if (onToggleFavorite) {
      onToggleFavorite(job);
    }
  };

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        if (filters.contract !== "Tous" && !j.contract.toLowerCase().includes(filters.contract.toLowerCase())) return false;
        if (filters.location && !j.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (j.rate < filters.rateMin) return false;
        if (j.match < filters.matchMin) return false;
        return true;
      }),
    [jobs, filters],
  );

  const activeCount = [filters.contract !== "Tous", filters.location !== "", filters.rateMin > 10, filters.matchMin > 0].filter(Boolean).length;

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col lg:flex-row">
      {showFilters && <FilterModal filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}

      <Sidebar active="feed" onNavigate={onNavigate} onTabChange={onNavigateToTab} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="px-5 lg:px-8 pt-12 lg:pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackBtn onClick={() => onNavigate("role-select")} />
            <div>
              <div className="lg:hidden"><AppName size="sm" /></div>
              <p className="text-xs text-muted-foreground mt-0.5 lg:mt-0 lg:text-sm">
                France · {loading ? "Chargement..." : `${filtered.length} offres disponibles`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onNavigateToTab) onNavigateToTab("profile");
              onNavigate("c-dashboard");
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent/40 border border-border"
          >
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-sm text-muted-foreground animate-pulse">Récupération des offres de la plateforme et de France Travail...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-muted-foreground text-sm">Aucune offre ne correspond à ces critères</p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-primary text-sm font-medium underline underline-offset-2">Réinitialiser</button>
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
                        <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-1">{job.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{job.salon}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1 line-clamp-1"><ILocation />{job.location}</span>
                        <span className="flex items-center gap-1 shrink-0"><IClock />{job.shift}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4 h-12 overflow-hidden">
                        {(job.tags || []).map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-2xl text-foreground">{job.rate}€</span>
                          <span className="text-xs text-muted-foreground">/h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleFav(job)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary transition-colors">
                            <IHeart filled={favorites.includes(job.id)} />
                          </button>
                          <button
                            onClick={() => { setSelectedJob(job); onNavigate("job-detail"); }}
                            className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            Consulter <IArrow />
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

        <BottomNav active="feed" onNavigate={onNavigate} onTabChange={onNavigateToTab} />
      </div>
    </div>
  );
}
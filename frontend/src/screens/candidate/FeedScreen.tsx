import { useEffect, useMemo, useState, useRef } from "react";
import type { DashTab, Filters, Job, Screen } from "../../types";
import { JOBS } from "../../data/mockData";
import { AppName, BackBtn, MatchRing } from "../../components/ui";
import { IArrow, IClock, IFilter, IHeart, ILocation, IUser } from "../../components/icons";
import { FilterModal } from "../../components/candidate/FilterModal";
import { BottomNav } from "../../components/candidate/BottomNav";
import { Sidebar } from "../../components/candidate/Sidebar";
import { getJobImage } from "../../utils/mapperFTJobs";

const DEFAULT_FILTERS: Filters = { contract: "Tous", location: "", rateMin: 10, matchMin: 0 };

let feedScrollPosition = 0;

function normalizeCity(loc: string): string {
  if (!loc) return "";
  const cleaned = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const match = cleaned.match(/paris|lyon|marseille|bordeaux|lille|toulouse|nice|nantes|strasbourg|rennes/i);
  return match ? match[0] : cleaned;
}

interface FeedScreenProps {
  onNavigate: (s: Screen) => void;
  setSelectedJob: (j: Job) => void;
  favorites?: (string | number)[];
  onToggleFavorite?: (job: Job) => void;
  onNavigateToTab?: (tab: DashTab) => void;
}

export function FeedScreen({
  onNavigate,
  setSelectedJob,
  favorites = [],
  onToggleFavorite,
}: FeedScreenProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const wheelAccumulator = useRef<number>(0);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadJobs = async (isPull = false) => {
    if (isPull) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const apiHost = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;
      const res = await fetch(`http://${apiHost}:8000/api/jobs?source=feed`);
      if (!res.ok) throw new Error("Erreur réseau API");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
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
          image: getJobImage(item.id || idx, item.image),
          description: item.description || "Aucune description disponible.",
          dates: item.dates || "Dates à convenir",
          diplomas: item.diplomas || ["CAP Coiffure"],
          benefits: item.benefits || ["Mutuelle"],
          urlOrigine: item.urlOrigine || (item.origineOffre ? item.origineOffre.urlOrigine : undefined),
          isInternal: Boolean(String(item.id || "").startsWith("rec") && !item.urlOrigine && !item.origineOffre),
          recruiterEmail: item.recruiterEmail || item.recruiterId || undefined,
        }));

        setJobs(formattedJobs);
      } else {
        setJobs(JOBS);
      }

      if (isPull) {
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2000);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement du feed candidat :", err);
      if (!isPull) setJobs(JOBS);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs(false);
  }, []);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = feedScrollPosition;
        }
      }, 0);
    }
  }, [loading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    feedScrollPosition = e.currentTarget.scrollTop;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || !scrollRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // L'utilisateur tire vers le bas alors qu'on est au sommet (scrollTop <= 0)
    if (scrollRef.current.scrollTop <= 0 && diff > 0) {
      const dist = Math.min(diff * 0.45, 80);
      setPullDistance(dist);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= 45 && !isRefreshing) {
      try {
        navigator.vibrate?.(30);
      } catch (e) {}
      loadJobs(true);
    }
    setPullDistance(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current || isRefreshing) return;

    // Détection de scroll vers le haut quand on est déjà tout en haut (scrollTop <= 0 et deltaY négatif)
    if (scrollRef.current.scrollTop <= 0 && e.deltaY < 0) {
      wheelAccumulator.current += Math.abs(e.deltaY);
      const dist = Math.min(wheelAccumulator.current * 0.35, 75);
      setPullDistance(dist);

      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => {
        if (wheelAccumulator.current > 100 && !isRefreshing) {
          try {
            navigator.vibrate?.(30);
          } catch (e) {}
          loadJobs(true);
        }
        wheelAccumulator.current = 0;
        setPullDistance(0);
      }, 250);
    }
  };

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        if (filters.contract !== "Tous" && !j.contract.toLowerCase().includes(filters.contract.toLowerCase())) return false;
        
        if (filters.location) {
          const targetCity = normalizeCity(filters.location);
          const jobCity = normalizeCity(j.location);
          if (!jobCity.includes(targetCity) && !j.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
          }
        }

        if (j.rate < filters.rateMin) return false;
        if (j.match < filters.matchMin) return false;
        return true;
      }),
    [jobs, filters],
  );

  const activeCount = [filters.contract !== "Tous", filters.location !== "", filters.rateMin > 10, filters.matchMin > 0].filter(Boolean).length;

  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col lg:flex-row relative">
      {showFilters && <FilterModal filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}

      <Sidebar active="feed" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col h-full w-full relative min-w-0 min-h-0">
        
        {/* En-tête flottant */}
        <div className="absolute top-0 left-0 right-0 z-20 px-5 lg:px-8 pt-10 lg:pt-6 pb-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <BackBtn onClick={() => onNavigate("role-select")} />
            <div>
              <div className="lg:hidden"><AppName size="sm" /></div>
              <p className="text-xs text-white/80 mt-0.5 lg:mt-0 lg:text-sm font-medium">
                France · {loading ? "Chargement..." : `${filtered.length} offres`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
                activeCount > 0 ? "bg-primary text-primary-foreground border-primary" : "bg-black/40 text-white border-white/20 hover:border-white/50"
              }`}
            >
              <IFilter />
              Filtres
              {activeCount > 0 && <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-black text-[10px] font-bold">{activeCount}</span>}
            </button>

            <button 
              onClick={() => onNavigate("c-dashboard")} 
              title="Mon profil"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-md text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              <IUser />
            </button>
          </div>
        </div>

        {/* Indicateur Pull-to-Refresh flottant */}
        {(pullDistance > 0 || isRefreshing || refreshSuccess) && (
          <div 
            className="absolute top-20 lg:top-16 left-0 right-0 z-30 flex justify-center pointer-events-none transition-all duration-200"
            style={{
              transform: `translateY(${isRefreshing ? 10 : Math.min(pullDistance * 0.45, 20)}px)`,
              opacity: isRefreshing || refreshSuccess ? 1 : Math.min(pullDistance / 35, 1),
            }}
          >
            <div className="bg-black/85 backdrop-blur-xl border border-white/25 text-white shadow-2xl rounded-full px-4 py-2 flex items-center gap-2.5 text-xs font-semibold">
              {isRefreshing ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Actualisation des offres...</span>
                </>
              ) : refreshSuccess ? (
                <>
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="text-emerald-300">Offres actualisées !</span>
                </>
              ) : (
                <>
                  <svg 
                    className="w-4 h-4 text-white transition-transform duration-200" 
                    style={{ transform: pullDistance >= 45 ? "rotate(180deg)" : "rotate(0deg)" }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                  <span>{pullDistance >= 45 ? "Relâchez pour actualiser" : "Glissez pour actualiser"}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Snap Scroll Vertical */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{
            transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.35, 28)}px)` : undefined,
            transition: pullDistance === 0 ? "transform 0.25s ease-out" : "none",
          }}
          className="flex-1 overflow-y-auto snap-y snap-mandatory scrollable h-full w-full"
        >
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-white/70 text-sm animate-pulse">
              Chargement des offres...
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center px-5">
              <p className="text-white/80 text-sm">Aucune offre ne correspond à ces critères</p>
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-primary text-sm font-medium underline">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filtered.map((job) => (
              <div
                key={job.id}
                className="h-full w-full snap-start snap-always relative flex flex-col justify-end overflow-hidden shrink-0"
              >
                <img src={job.image} alt={job.salon} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

                <div className="relative z-10 p-6 lg:p-10 pb-24 lg:pb-6 max-w-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/20">
                      {job.contract}
                    </span>
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <MatchRing score={job.match} size={28} />
                      <span className="text-xs font-bold text-white">{job.match}% match</span>
                    </div>
                  </div>

                  <h2 className="font-serif text-2xl lg:text-4xl font-bold text-white leading-tight mb-1">
                    {job.title}
                  </h2>
                  <p className="text-sm lg:text-base text-white/80 font-medium mb-3">
                    {job.salon}
                  </p>

                  <div className="flex items-center gap-4 text-xs lg:text-sm text-white/70 mb-3">
                    <span className="flex items-center gap-1.5"><ILocation />{job.location}</span>
                    <span className="flex items-center gap-1.5"><IClock />{job.shift}</span>
                  </div>

                  {job.description && (
                    <p className="text-xs lg:text-sm text-white/90 line-clamp-2 leading-relaxed mb-4 max-w-2xl bg-black/30 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                      {job.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-6 max-h-16 overflow-hidden">
                    {(job.tags || []).map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md text-xs font-medium text-white/90 border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/15">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-white">{job.rate}€</span>
                      <span className="text-xs text-white/70">/h</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleFavorite && onToggleFavorite(job)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all text-white cursor-pointer"
                      >
                        <IHeart filled={favorites.includes(job.id)} />
                      </button>

                      <button
                        onClick={() => { setSelectedJob(job); onNavigate("job-detail"); }}
                        className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg"
                      >
                        Postuler <IArrow />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-black/80 backdrop-blur-lg border-t border-white/10">
          <BottomNav active="feed" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
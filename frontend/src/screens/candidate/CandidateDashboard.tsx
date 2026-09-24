/**
 * Tableau de bord du candidat intérimaire : suivi des candidatures, favoris et édition de profil.
 */
import { useState, useEffect, type ReactNode } from "react";
import type { DashTab, Job, Screen } from "../../types";
import { APPLICATIONS as MOCK_APPLICATIONS, DAYS, SKILLS } from "../../data/mockData";
import { BackBtn, MatchRing, StatusBadge, Tag } from "../../components/ui";
import { IBriefcase, ICalendar, IClock, IHeart, ILogout, IPencil, IStar, IUser } from "../../components/icons";
import { BottomNav } from "../../components/candidate/BottomNav";
import { Sidebar } from "../../components/candidate/Sidebar";

export function CandidateDashboard({
  onNavigate,
  activeTab = "applications",
  onTabChange,
  favoriteJobs = [],
  onToggleFavorite,
  onSelectJob,
  loadingFavorites = false,
  onBack,
}: {
  onNavigate: (s: Screen) => void;
  onBack?: () => void;
  activeTab?: DashTab;
  onTabChange?: (t: DashTab) => void;
  favoriteJobs?: Job[];
  onToggleFavorite?: (job: Job) => void;
  onSelectJob?: (job: Job) => void;
  loadingFavorites?: boolean;
}) {
  const [tab, setTabState] = useState<DashTab>(activeTab);

  // Profil intérimaire synchronisé avec Airtable
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("candidate_profile");
    return saved
      ? JSON.parse(saved)
      : {
          id: "",
          fullName: "Marie Dupont",
          title: "Coloriste · Expert",
          location: "Paris, 25 km",
          skills: ["CAP Coiffure", "Coloriste", "Balayage", "Visagisme", "Kératine"],
          phone: "",
          bio: "",
          expectedRate: 15,
        };
  });

  const [editName, setEditName] = useState(profile.fullName);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [editBio, setEditBio] = useState(profile.bio || "");
  const [editRate, setEditRate] = useState(profile.expectedRate || 15);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.skills || []);

  // Candidatures réelles synchronisées depuis Airtable
  const [applications, setApplications] = useState<any[]>(MOCK_APPLICATIONS);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setTabState(activeTab);
    }
  }, [activeTab]);

  // Chargement initial du profil et des candidatures depuis Airtable
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("user_email");

    // 1. Récupération profil Airtable
    const profileUrl = userId
      ? `/api/profile?userId=${encodeURIComponent(userId)}`
      : email
      ? `/api/profile?userId=${encodeURIComponent(email)}`
      : `/api/profile`;

    fetch(profileUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (data.fullName || data.firstName || data.email)) {
          const loaded = {
            id: data.id || userId,
            fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || "Intérimaire",
            title: data.title || data.diploma || "Coiffeur / Coiffeuse",
            location: data.location || data.locationCity || "Paris",
            skills: Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : ["CAP Coiffure", "Coloriste"],
            phone: data.phone || "",
            bio: data.bio || "",
            expectedRate: data.expectedRate || 15,
          };
          setProfile(loaded);
          setEditName(loaded.fullName);
          setEditTitle(loaded.title);
          setEditLocation(loaded.location);
          setEditPhone(loaded.phone);
          setEditBio(loaded.bio);
          setEditRate(loaded.expectedRate);
          setSelectedSkills(loaded.skills);
          localStorage.setItem("candidate_profile", JSON.stringify(loaded));
        }
      })
      .catch((err) => console.warn("[CANDIDAT] Erreur chargement profil Airtable :", err));

    // 2. Récupération des candidatures depuis Airtable
    setLoadingApps(true);
    const appsUrl = userId
      ? `/api/applications?candidateId=${encodeURIComponent(userId)}`
      : `/api/applications`;

    fetch(appsUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any, idx: number) => ({
            id: item.id || `app-${idx}`,
            title: item.title || item.missionTitle || "Mission Coiffure",
            salon: item.salon || item.missionSalon || "Salon Partenaire",
            date: item.date || "Récemment",
            status: item.status === "accepted" ? "accepted" : item.status === "rejected" ? "rejected" : "pending",
          }));
          setApplications(formatted);
        }
      })
      .catch((err) => console.warn("[CANDIDAT] Erreur chargement candidatures :", err))
      .finally(() => setLoadingApps(false));
  }, []);

  const setTab = (t: DashTab) => {
    setTabState(t);
    if (onTabChange) onTabChange(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("candidate_profile");
    localStorage.removeItem("user_mode");
    onNavigate("role-select");
  };

  // Sauvegarde des modifications du profil directement dans Airtable
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSaveSuccessMsg(null);

    const token = localStorage.getItem("auth_token");
    const userId = profile.id || localStorage.getItem("userId") || localStorage.getItem("user_email");

    const payload = {
      userId,
      fullName: editName,
      title: editTitle,
      diploma: editTitle,
      locationCity: editLocation.split(',')[0].trim(),
      location: editLocation,
      skills: selectedSkills,
      phone: editPhone,
      bio: editBio,
      expectedRate: Number(editRate),
    };

    try {
      const res = await fetch(`/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'enregistrement de votre profil.");
      }

      const updated = {
        ...profile,
        fullName: editName,
        title: editTitle,
        location: editLocation,
        skills: selectedSkills,
        phone: editPhone,
        bio: editBio,
        expectedRate: Number(editRate),
      };

      setProfile(updated);
      localStorage.setItem("candidate_profile", JSON.stringify(updated));
      setIsEditing(false);
      setSaveSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("❌ [CANDIDAT] Erreur sauvegarde profil :", err);
      alert("Impossible d'enregistrer vos modifications : " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleSkill = (s: string) => {
    setSelectedSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  };

  const TABS: { key: DashTab; label: string; icon: ReactNode }[] = [
    { key: "applications", label: "Candidatures", icon: <IBriefcase /> },
    { key: "favorites", label: "Favoris", icon: <IStar /> },
    { key: "profile", label: "Profil", icon: <IUser /> },
  ];

  const navActive = tab === "applications" ? "feed" : tab === "favorites" ? "favorites" : "profile";

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar active={navActive} onNavigate={onNavigate} onTabChange={setTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 lg:px-8 pt-12 lg:pt-8 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackBtn onClick={() => (onBack ? onBack() : onNavigate("feed"))} />
            <div>
              <h1 className="font-serif text-2xl text-foreground">Mon espace</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.fullName} · {profile.title}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors shadow-sm cursor-pointer"
            title="Se déconnecter"
          >
            <ILogout />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>

        {/* Message de succès feedback */}
        {saveSuccessMsg && (
          <div className="mx-5 lg:mx-8 mb-3 px-4 py-2.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span>✅ {saveSuccessMsg}</span>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-green-800 dark:text-green-200 font-bold ml-2">×</button>
          </div>
        )}

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
          <div className="max-w-6xl mx-auto w-full">
            
            {/* ── Onglet Candidatures (Synchronisé Airtable) ──────── */}
            {tab === "applications" && (
              <div className="flex flex-col gap-3 lg:max-w-2xl">
                {loadingApps ? (
                  <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
                    Chargement de vos candidatures...
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-16 px-4 text-center bg-card rounded-2xl border border-dashed border-border">
                    <p className="font-semibold text-base text-foreground mb-1">Aucune candidature envoyée</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Explorez les missions disponibles et postulez pour suivre vos réponses ici.
                    </p>
                    <button
                      onClick={() => onNavigate("feed")}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                    >
                      Voir les offres
                    </button>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-xs">
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
                  ))
                )}
              </div>
            )}

            {/* ── Onglet Favoris ──────────────────────────────────── */}
            {tab === "favorites" && (
              <div>
                {loadingFavorites ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-sm text-muted-foreground animate-pulse">Chargement de vos favoris...</p>
                  </div>
                ) : favoriteJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-2xl border border-dashed border-border max-w-lg mx-auto">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary mb-3">
                      <IStar />
                    </div>
                    <h3 className="font-semibold text-base text-foreground mb-1">Aucune offre en favoris</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Vous n'avez pas encore ajouté d'offres à vos favoris. Parcourez les offres disponibles et cliquez sur le cœur pour les retrouver ici.
                    </p>
                    <button
                      onClick={() => onNavigate("feed")}
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                    >
                      Explorer les offres
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {favoriteJobs.map((job) => (
                      <div key={job.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-32 bg-muted overflow-hidden">
                          <img src={job.image} alt={job.salon} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => onToggleFavorite && onToggleFavorite(job)}
                              title="Retirer des favoris"
                              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm cursor-pointer"
                            >
                              <IHeart filled={true} />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-3">
                            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-semibold text-foreground">
                              {job.contract || "Intérim"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">{job.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{job.salon} · {job.location}</p>
                            </div>
                            <div className="shrink-0">
                              <MatchRing score={job.match || 80} size={40} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="font-serif text-lg text-foreground">
                              {job.rate}€<span className="text-xs text-muted-foreground font-sans">/h</span>
                            </span>
                            <button
                              onClick={() => {
                                if (onSelectJob) onSelectJob(job);
                                onNavigate("job-detail");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                            >
                              Consulter
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Onglet Profil Éditable & Synchronisé avec Airtable ── */}
            {tab === "profile" && (
              <div className="flex flex-col gap-5">
                <div className="bg-card rounded-2xl border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-serif text-xl font-bold">
                      {profile.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1 w-full">
                    {isEditing ? (
                      <div className="flex flex-col gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Nom et Prénom
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="ex. Sophie Martin"
                            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Titre / Diplôme
                            </label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="ex. Coloriste · Expert"
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Ville / Rayon
                            </label>
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              placeholder="ex. Paris, 25 km"
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Téléphone
                            </label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="ex. 06 12 34 56 78"
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Tarif souhaité (€/h)
                            </label>
                            <input
                              type="number"
                              value={editRate}
                              onChange={(e) => setEditRate(Number(e.target.value))}
                              placeholder="ex. 18"
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Bio / Présentation
                          </label>
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            placeholder="Décrivez brièvement votre parcours et vos techniques favorites..."
                            rows={2}
                            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground text-lg">{profile.fullName}</p>
                        <p className="text-sm text-muted-foreground">{profile.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{profile.location} {profile.expectedRate ? `· ${profile.expectedRate}€/h` : ''}</p>
                        {profile.phone && <p className="text-xs text-muted-foreground">📞 {profile.phone}</p>}
                        {profile.bio && <p className="text-xs text-muted-foreground mt-1 italic">"{profile.bio}"</p>}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {isEditing && (
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={savingProfile}
                        className="px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                      disabled={savingProfile}
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <IPencil />
                      <span>{savingProfile ? "Enregistrement..." : isEditing ? "Enregistrer" : "Modifier mon profil"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5">
                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm font-semibold text-foreground mb-3">Compétences</p>
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1.5">
                        {SKILLS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSkill(s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                              selectedSkills.includes(s)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s: string) => (
                          <Tag key={s}>{s}</Tag>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-sm font-semibold text-foreground mb-3">Disponibilités</p>
                    <div className="flex items-center gap-2 mb-3">
                      <ICalendar />
                      <span className="text-xs text-foreground font-medium">Immédiate</span>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      {DAYS.map((d) => (
                        <div
                          key={d}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium text-center ${
                            ["Lun", "Mar", "Mer", "Jeu", "Ven"].includes(d)
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <IClock />
                      <span className="text-xs text-muted-foreground">9h – 18h</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 lg:max-w-2xl gap-3">
                  {[
                    { label: "Candidatures", value: String(applications.length) },
                    { label: "Favoris", value: String(favoriteJobs.length) },
                    { label: "Score moyen", value: "85%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
                      <p className="font-serif text-2xl text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 lg:max-w-2xl">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors shadow-sm cursor-pointer"
                  >
                    <ILogout />
                    <span>Se déconnecter de mon compte</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <BottomNav active={navActive} onNavigate={onNavigate} onTabChange={setTab} />
      </div>
    </div>
  );
}
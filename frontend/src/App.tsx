// ════════════════════════════════════════════════════════════
// App.tsx — état global + routeur
// ════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import type { DashTab, Job, Mission, Screen, UserMode } from "./types";
import { JOBS, MISSIONS_INIT } from "./data/mockData";
import { AppName } from "./components/ui";

import { RoleSelectScreen } from "./screens/auth/RoleSelectScreen";
import { AuthScreen } from "./screens/auth/AuthScreen";
import { Onboarding1Screen } from "./screens/onboarding/Onboarding1Screen";
import { CVUploadScreen } from "./screens/onboarding/CVUploadScreen";
import { ManualEntryScreen } from "./screens/onboarding/ManualEntryScreen";
import { Onboarding2Screen } from "./screens/onboarding/Onboarding2Screen";
import { FeedScreen } from "./screens/candidate/FeedScreen";
import { JobDetailScreen } from "./screens/candidate/JobDetailScreen";
import { CandidateDashboard } from "./screens/candidate/CandidateDashboard";
import { RecruiterDashboard } from "./screens/recruiter/RecruiterDashboard";
import { MissionCreateScreen } from "./screens/recruiter/MissionCreateScreen";
import { MissionEditScreen } from "./screens/recruiter/MissionEditScreen";

const FORM_FLOW_SCREENS: Screen[] = ["role-select", "auth", "onboarding1", "cv-upload", "manual-entry", "onboarding2"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("role-select");
  const [userMode, setUserMode] = useState<UserMode>("candidate");
  const [selectedJob, setSelectedJob] = useState<Job>(JOBS[0]);
  const [editingMission, setEditingMission] = useState<Mission>(MISSIONS_INIT[0]);
  
  const [jobsList, setJobsList] = useState<Job[]>(JOBS);
  const [dashTab, setDashTab] = useState<DashTab>("applications");

  // Centralisation des favoris avec persistance
  const [favoriteJobIds, setFavoriteJobIds] = useState<(string | number)[]>(() => {
    const saved = localStorage.getItem("candidate_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const userEmail = localStorage.getItem("user_email") || "";

  useEffect(() => {
    // Synchronise l'URL initiale au chargement
    const hash = window.location.hash.replace("#", "") as Screen;
    if (hash) {
      setScreen(hash);
    } else {
      window.history.replaceState({ screen: "role-select" }, "", "#role-select");
    }

    // Écoute les retours en arrière (bouton physique ou navigateur)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen);
      } else {
        const currentHash = window.location.hash.replace("#", "") as Screen;
        if (currentHash) setScreen(currentHash);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
    window.history.pushState({ screen: s }, "", `#${s}`);
  };

  const handleToggleFavorite = (job: Job) => {
    setFavoriteJobIds((prev) => {
      const updated = prev.includes(job.id) ? prev.filter((id) => id !== job.id) : [...prev, job.id];
      localStorage.setItem("candidate_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const favoriteJobs = jobsList.filter((j) => favoriteJobIds.includes(j.id));

  useEffect(() => {
    const apiHost = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;
    const url = userMode === "recruiter" && userEmail
      ? `http://${apiHost}:8000/api/jobs?recruiterEmail=${encodeURIComponent(userEmail)}`
      : `http://${apiHost}:8000/api/jobs?source=feed`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau API");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedJobs: Job[] = data
            .filter((m: any) => m && (m.title || m.intitule))
            .map((m: any, idx: number) => ({
              id: m.id || `job-${idx}`,
              title: m.title || m.intitule || "Mission sans titre",
              salon: m.salon || (m.entreprise ? m.entreprise.nom : "Salon Partenaire"),
              location: m.location || (m.lieuTravail ? m.lieuTravail.libelle : "Localisation non précisée"),
              contract: m.contract || m.typeContratLibelle || "Intérim",
              rate: Number(m.rate || 15),
              shift: m.shift || "09:00 - 18:00",
              tags: m.tags || m.skills || ["Coiffure"],
              skills: m.skills || m.tags || [],
              match: m.match || 80,
              image: m.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
              description: m.description || "",
              dates: m.dates || "Dates à convenir",
              diplomas: m.diplomas || ["CAP Coiffure"],
              benefits: m.benefits || ["Mutuelle"],
              sortDate: m.startDate ? new Date(m.startDate) : new Date(),
            }));

          setJobsList(formattedJobs);
        }
      })
      .catch((err) => console.warn("⚠️ [FRONTEND] Erreur API :", err.message));
  }, [userMode, userEmail, screen]);

  // Conversion propre Job[] -> Mission[]
  const recruiterMissions: Mission[] = jobsList.map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description || "",
    startDate: "",
    endDate: "",
    dates: j.dates || "Dates à convenir",
    sortDate: j.sortDate ? new Date(j.sortDate) : new Date(),
    location: j.location,
    rate: j.rate,
    shift: j.shift,
    skills: j.skills || j.tags || [],
    count: 0,
    status: "open",
  }));

  const isFormFlow = FORM_FLOW_SCREENS.includes(screen);

  const activeScreen = (
    <div key={screen} className="screen-enter">
      {screen === "role-select" && <RoleSelectScreen onNavigate={go} setUserMode={setUserMode} />}
      {screen === "auth" && <AuthScreen onNavigate={go} userMode={userMode} />}

      {/* Parcours candidat */}
      {screen === "onboarding1" && <Onboarding1Screen onNavigate={go} />}
      {screen === "cv-upload" && <CVUploadScreen onNavigate={go} />}
      {screen === "manual-entry" && <ManualEntryScreen onNavigate={go} />}
      {screen === "onboarding2" && <Onboarding2Screen onNavigate={go} />}
      
      {screen === "feed" && (
        <FeedScreen
          onNavigate={go}
          setSelectedJob={setSelectedJob}
          favorites={favoriteJobIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      
      {screen === "job-detail" && <JobDetailScreen job={selectedJob} onNavigate={go} />}
      
      {screen === "c-dashboard" && (
        <CandidateDashboard
          onNavigate={go}
          activeTab={dashTab}
          onTabChange={setDashTab}
          favoriteJobs={favoriteJobs}
          onToggleFavorite={handleToggleFavorite}
          onSelectJob={setSelectedJob}
        />
      )}

      {/* Parcours recruteur */}
      {screen === "r-dashboard" && (
        <RecruiterDashboard
          onNavigate={go}
          missions={recruiterMissions}
          onEditMission={(m) => {
            setEditingMission(m);
            go("r-mission-edit");
          }}
        />
      )}
      {screen === "r-create" && (
        <MissionCreateScreen
          onNavigate={go}
          onCreateMission={(m) => {
            const newJob: Job = {
              id: m.id,
              title: m.title,
              salon: "Votre Salon",
              location: m.location,
              contract: "Intérim",
              rate: m.rate,
              shift: m.shift,
              tags: m.skills,
              skills: m.skills,
              match: 100,
              image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600",
              description: m.description,
              dates: m.dates,
              diplomas: ["CAP Coiffure"],
              benefits: ["Mutuelle"],
            };
            setJobsList((prev) => [newJob, ...prev]);
          }}
        />
      )}
      {screen === "r-mission-edit" && (
        <MissionEditScreen
          mission={editingMission}
          onNavigate={go}
          onSave={(updated) =>
            setJobsList((p) =>
              p.map((j) => (String(j.id) === String(updated.id) ? { ...j, ...updated, tags: updated.skills } : j))
            )
          }
        />
      )}
    </div>
  );

  if (!isFormFlow) return activeScreen;

  return (
    <div className="min-h-screen bg-background lg:flex">
      <div className="hidden lg:flex lg:w-[42%] lg:min-w-[380px] lg:max-w-[520px] lg:shrink-0 lg:h-screen lg:sticky lg:top-0 lg:flex-col lg:items-center lg:justify-center relative overflow-hidden bg-gradient-to-br from-secondary via-accent/20 to-muted">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/8" />
        <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-accent/25" />
        <div className="relative flex flex-col items-center gap-4 text-center px-10">
          <AppName size="lg" />
          <p className="text-base text-muted-foreground max-w-[280px]">
            La plateforme qui connecte les talents de la coiffure aux salons qui les recherchent.
          </p>
        </div>
      </div>

      <div className="lg:flex-1 lg:flex lg:justify-center lg:overflow-y-auto lg:h-screen">
        <div className="w-full lg:max-w-2xl lg:px-16 lg:py-14">
          {activeScreen}
        </div>
      </div>
    </div>
  );
}
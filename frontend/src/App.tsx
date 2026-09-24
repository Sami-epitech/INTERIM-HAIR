/**
 * Composant racine de l'application : gestion du routage par hachage et de l'état global.
 */
import { useState, useEffect } from "react";
import type { DashTab, Job, Mission, Screen, UserMode } from "./types";
import { JOBS, MISSIONS_INIT } from "./data/mockData";
import { AppName } from "./components/ui";
import { getJobImage } from "./utils/mapperFTJobs";

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
import { LegalScreen } from "./screens/LegalScreen";

const FORM_FLOW_SCREENS: Screen[] = ["role-select", "auth", "onboarding1", "cv-upload", "manual-entry", "onboarding2"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("role-select");
  const [userMode, setUserMode] = useState<UserMode>(() => {
    return (localStorage.getItem("user_mode") as UserMode) || "candidate";
  });
  const [historyStack, setHistoryStack] = useState<Screen[]>([]);

  const [selectedJob, setSelectedJob] = useState<Job>(JOBS[0]);
  const [editingMission, setEditingMission] = useState<Mission>(MISSIONS_INIT[0]);

  const [jobsList, setJobsList] = useState<Job[]>(JOBS);
  const [dashTab, setDashTab] = useState<DashTab>("applications");

  // Vérifie si un utilisateur possède une session active
  const isUserLoggedIn = () => {
    return Boolean(
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("user_email")
    );
  };

  // Centralisation des favoris avec persistance Airtable
  const [favoriteJobIds, setFavoriteJobIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem("candidate_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [apiFavoriteJobs, setApiFavoriteJobs] = useState<Job[]>([]);

  const userEmail = localStorage.getItem("user_email") || "";

  // Chargement et synchronisation des favoris depuis Airtable
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId") || localStorage.getItem("user_email");

    const favUrl = userId
      ? `/api/favorites?candidateId=${encodeURIComponent(userId)}`
      : `/api/favorites`;

    fetch(favUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.favoriteIds)) {
          setFavoriteJobIds(data.favoriteIds);
          localStorage.setItem("candidate_favorites", JSON.stringify(data.favoriteIds));
        }
        if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setApiFavoriteJobs(data.jobs);
        }
      })
      .catch((err) => console.warn("[FAVORIS] Erreur chargement Airtable :", err));
  }, [userEmail, screen]);

  useEffect(() => {
    const loggedIn = isUserLoggedIn();
    const savedMode = (localStorage.getItem("user_mode") as UserMode) || userMode;
    const defaultHome: Screen = savedMode === "recruiter" ? "r-dashboard" : "feed";
    const hash = window.location.hash.replace("#", "") as Screen;

    // Si déjà connecté, bloquer l'accès à role-select et auth
    if (loggedIn && (!hash || hash === "role-select" || hash === "auth")) {
      setScreen(defaultHome);
      window.history.replaceState({ screen: defaultHome }, "", `#${defaultHome}`);
    } else if (hash) {
      setScreen(hash);
    } else {
      window.history.replaceState({ screen: "role-select" }, "", "#role-select");
    }

    // Écoute les retours en arrière (bouton physique ou navigateur)
    const handlePopState = (event: PopStateEvent) => {
      const targetScreen = (event.state?.screen || window.location.hash.replace("#", "")) as Screen;
      const stillLoggedIn = isUserLoggedIn();
      const currentMode = (localStorage.getItem("user_mode") as UserMode) || "candidate";
      const homeScreen: Screen = currentMode === "recruiter" ? "r-dashboard" : "feed";

      // Empêche le retour physique/navigateur de déconnecter l'utilisateur
      if (stillLoggedIn && (!targetScreen || targetScreen === "role-select" || targetScreen === "auth")) {
        setScreen(homeScreen);
        window.history.replaceState({ screen: homeScreen }, "", `#${homeScreen}`);
        return;
      }

      if (targetScreen) {
        setScreen(targetScreen);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const go = (s: Screen, replace = false) => {
    const loggedIn = isUserLoggedIn();
    const currentMode = (localStorage.getItem("user_mode") as UserMode) || userMode;
    const homeScreen: Screen = currentMode === "recruiter" ? "r-dashboard" : "feed";

    // Si connecté, le seul moyen de se déconnecter est le bouton déconnexion
    // (qui efface localStorage avant d'appeler go('role-select'))
    if (loggedIn && (s === "role-select" || s === "auth")) {
      if (screen !== homeScreen) {
        setScreen(homeScreen);
        window.history.replaceState({ screen: homeScreen }, "", `#${homeScreen}`);
      }
      return;
    }

    if (!replace && s !== screen) {
      setHistoryStack((prev) => [...prev, screen]);
    }

    // Réinitialisation de la pile d'historique lors d'une déconnexion explicite
    if (s === "role-select") {
      setHistoryStack([]);
    }

    setScreen(s);
    window.scrollTo(0, 0);
    if (replace) {
      window.history.replaceState({ screen: s }, "", `#${s}`);
    } else {
      window.history.pushState({ screen: s }, "", `#${s}`);
    }
  };

  const goBack = (fallback?: Screen) => {
    const loggedIn = isUserLoggedIn();
    const currentMode = (localStorage.getItem("user_mode") as UserMode) || userMode;
    const defaultHome: Screen = currentMode === "recruiter" ? "r-dashboard" : "feed";

    setHistoryStack((prevStack) => {
      const newStack = [...prevStack];

      while (newStack.length > 0) {
        const prev = newStack.pop()!;
        // Si connecté, ignorer les écrans d'authentification du retour arrière
        if (loggedIn && (prev === "role-select" || prev === "auth")) {
          continue;
        }
        if (prev !== screen) {
          setScreen(prev);
          window.scrollTo(0, 0);
          window.history.pushState({ screen: prev }, "", `#${prev}`);
          return newStack;
        }
      }

      // Aucun écran valide précédent : rester sur le dashboard ou fallback
      const target = fallback || (loggedIn ? defaultHome : "role-select");
      if (target !== screen) {
        setScreen(target);
        window.scrollTo(0, 0);
        window.history.pushState({ screen: target }, "", `#${target}`);
      }
      return newStack;
    });
  };

  const hasHistory = historyStack.some((s) => {
    if (isUserLoggedIn() && (s === "role-select" || s === "auth")) return false;
    return s !== screen;
  });

  // Bascule de favori avec synchronisation directe dans Airtable
  const handleToggleFavorite = async (job: Job) => {
    const isFav = favoriteJobIds.includes(job.id);
    const updated = isFav ? favoriteJobIds.filter((id) => id !== job.id) : [...favoriteJobIds, job.id];
    setFavoriteJobIds(updated);
    localStorage.setItem("candidate_favorites", JSON.stringify(updated));

    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("userId") || localStorage.getItem("user_email");

    try {
      const res = await fetch(`/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          candidateId: userId,
          jobId: job.id,
          jobData: job,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favoriteIds)) {
          setFavoriteJobIds(data.favoriteIds);
          localStorage.setItem("candidate_favorites", JSON.stringify(data.favoriteIds));
        }
      }
    } catch (e) {
      console.warn("[FAVORIS] Erreur synchronisation Airtable :", e);
    }
  };

  // Combinaison des offres locales et chargées depuis Airtable
  const safeFavIds = Array.isArray(favoriteJobIds) ? favoriteJobIds : [];
  const favoriteJobs = Array.from(
    new Map(
      [
        ...(Array.isArray(jobsList) ? jobsList : []).filter((j) => safeFavIds.includes(j.id)),
        ...(Array.isArray(apiFavoriteJobs) ? apiFavoriteJobs : []).filter((j: any) => safeFavIds.includes(j.id) || (j.airtableId && safeFavIds.includes(j.airtableId))),
      ].map((j) => [j.id, j])
    ).values()
  );

  useEffect(() => {
    const url = userMode === "recruiter" && userEmail
      ? `/api/jobs?recruiterEmail=${encodeURIComponent(userEmail)}`
      : `/api/jobs?source=feed`;

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
              image: getJobImage(m.id || idx, m.image),
              description: m.description || "",
              dates: m.dates || "Dates à convenir",
              diplomas: m.diplomas || ["CAP Coiffure"],
              benefits: m.benefits || ["Mutuelle"],
              sortDate: m.startDate ? new Date(m.startDate) : new Date(),
            }));

          setJobsList(formattedJobs);
        }
      })
      .catch((err) => console.warn("[FRONTEND] Erreur API :", err.message));
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
      {screen === "legal" && <LegalScreen onNavigate={go} onBack={goBack} />}

      {/* Parcours candidat */}
      {screen === "onboarding1" && <Onboarding1Screen onNavigate={go} />}
      {screen === "cv-upload" && <CVUploadScreen onNavigate={go} />}
      {screen === "manual-entry" && <ManualEntryScreen onNavigate={go} />}
      {screen === "onboarding2" && <Onboarding2Screen onNavigate={go} />}

      {screen === "feed" && (
        <FeedScreen
          onNavigate={go}
          onBack={goBack}
          hasHistory={hasHistory}
          setSelectedJob={setSelectedJob}
          favorites={favoriteJobIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {screen === "job-detail" && (
        <JobDetailScreen
          job={selectedJob}
          onNavigate={go}
          onBack={goBack}
          isFavorite={favoriteJobIds.includes(selectedJob.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {screen === "c-dashboard" && (
        <CandidateDashboard
          onNavigate={go}
          onBack={goBack}
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
          onBack={goBack}
          hasHistory={hasHistory}
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
          onBack={goBack}
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
              image: getJobImage(m.id),
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
          onBack={goBack}
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
// ════════════════════════════════════════════════════════════
// App.tsx — état global + routeur fait maison
// ════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import type { Job, Mission, Screen, UserMode } from "./types";
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
  const [missions, setMissions] = useState<Mission[]>(MISSIONS_INIT);

  // E-mail du recruteur stocké lors de la connexion
  const userEmail = localStorage.getItem("user_email") || "";

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  // Chargement dynamique des missions selon le rôle (Recruteur vs Candidat)
  useEffect(() => {
    const url = userMode === "recruiter" && userEmail
      ? `http://localhost:8000/api/jobs?recruiterEmail=${encodeURIComponent(userEmail)}`
      : "http://localhost:8000/api/jobs?source=feed";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau API");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedMissions: Mission[] = data
            .filter((m: any) => m && (m.title || m.intitule))
            .map((m: any) => ({
              ...m,
              title: m.title || m.intitule || "Mission sans titre",
              location: m.location || (m.lieuTravail ? m.lieuTravail.libelle : "Localisation non précisée"),
              rate: Number(m.rate || 15),
              dates: m.dates || (m.startDate ? `${m.startDate} – ${m.endDate || ''}` : "Dates à convenir"),
              sortDate: m.sortDate ? new Date(m.sortDate) : new Date(),
            }));

          console.log(`✅ [FRONTEND] ${formattedMissions.length} missions chargées pour le mode : ${userMode}`);
          setMissions(formattedMissions);
        }
      })
      .catch((err) => console.warn("⚠️ [FRONTEND] Impossible de charger les offres depuis l'API :", err.message));
  }, [userMode, userEmail, screen]);

  // Gestion du retour OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      console.log("✅ [AUTH] Token OAuth reçu et stocké !");
      window.history.replaceState({}, document.title, window.location.pathname);
      setScreen(userMode === "candidate" ? "onboarding1" : "r-dashboard");
    }
  }, [userMode]);

  const handleEditMission = (m: Mission) => {
    setEditingMission(m);
    go("r-mission-edit");
  };

  const handleSaveMission = (updated: Mission) => {
    setMissions((p) => p.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddMission = (newMission: Mission) => {
    setMissions((prev) => [newMission, ...prev]);
  };

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
      {screen === "feed" && <FeedScreen onNavigate={go} setSelectedJob={setSelectedJob} />}
      {screen === "job-detail" && <JobDetailScreen job={selectedJob} onNavigate={go} />}
      {screen === "c-dashboard" && <CandidateDashboard onNavigate={go} />}

      {/* Parcours recruteur */}
      {screen === "r-dashboard" && <RecruiterDashboard onNavigate={go} missions={missions} onEditMission={handleEditMission} />}
      {screen === "r-create" && <MissionCreateScreen onNavigate={go} onCreateMission={handleAddMission} />}
      {screen === "r-mission-edit" && <MissionEditScreen mission={editingMission} onNavigate={go} onSave={handleSaveMission} />}
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
          <p className="text-base text-muted-foreground max-w-[280px]">La plateforme qui connecte les talents de la coiffure aux salons qui les recherchent.</p>
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
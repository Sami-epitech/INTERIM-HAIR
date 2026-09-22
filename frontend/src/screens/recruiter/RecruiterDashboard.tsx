import { useState } from "react";
import type { Applicant, Mission, RecTab, Screen } from "../../types";
import { MISSIONS_INIT } from "../../data/mockData";
import { BackBtn, MatchRing, StatusBadge, Tag } from "../../components/ui";
import { IArrow, ICalendar, ILogout, IPencil, IPlus } from "../../components/icons";

// Données de démonstration pour les candidats
const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 1,
    missionId: 1,
    name: "Clara Martin",
    match: 92,
    level: "Coloriste Expert",
    status: "En attente",
    initials: "CM",
    availFrom: "2026-10-01",
    availTo: "2026-12-31",
  },
  {
    id: 2,
    missionId: 1,
    name: "Thomas Bernard",
    match: 85,
    level: "Coiffeur Polyvalent",
    status: "Accepté",
    initials: "TB",
    availFrom: "2026-10-05",
    availTo: "2026-11-30",
  },
  {
    id: 3,
    missionId: 2,
    name: "Sophie Petit",
    match: 78,
    level: "Visagiste",
    status: "En attente",
    initials: "SP",
    availFrom: "2026-10-10",
    availTo: "2026-10-25",
  },
];

export function RecruiterDashboard({
  onNavigate,
  missions = MISSIONS_INIT,
  onEditMission,
}: {
  onNavigate: (s: Screen) => void;
  missions?: Mission[];
  onEditMission?: (m: Mission) => void;
}) {
  const [tab, setTab] = useState<RecTab>("missions");
  const [selectedMissionId, setSelectedMissionId] = useState<string | number | "all">("all");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user_email");
    onNavigate("role-select");
  };

  // Filtrage typé des candidats
  const filteredApplicants: Applicant[] =
    selectedMissionId === "all"
      ? MOCK_APPLICANTS
      : MOCK_APPLICANTS.filter((a: Applicant) => String(a.missionId) === String(selectedMissionId));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* En-tête */}
      <div className="px-5 pt-12 lg:pt-8 pb-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <BackBtn onClick={() => onNavigate("role-select")} />
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground">Espace Recruteur</h1>
            <p className="text-xs text-muted-foreground">Salon Élégance · Paris</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-100 transition-colors shadow-xs cursor-pointer"
        >
          <ILogout />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {/* Navigation Onglets */}
      <div className="px-5 border-b border-border bg-card flex items-center justify-between">
        <div className="flex gap-6">
          <button
            onClick={() => setTab("missions")}
            className={`pb-3 pt-3 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === "missions" ? "text-primary border-primary" : "text-muted-foreground border-transparent"
            }`}
          >
            Missions ({missions.length})
          </button>
          <button
            onClick={() => setTab("applicants")}
            className={`pb-3 pt-3 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === "applicants" ? "text-primary border-primary" : "text-muted-foreground border-transparent"
            }`}
          >
            Candidats ({MOCK_APPLICANTS.length})
          </button>
        </div>

        {tab === "missions" && (
          <button
            onClick={() => onNavigate("r-create")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <IPlus />
            <span>Publier une offre</span>
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 p-5 lg:p-8 max-w-6xl mx-auto w-full">
        {tab === "missions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((m: Mission) => (
              <div key={m.id} className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base text-foreground line-clamp-1">{m.title}</h3>
                    <button
                      onClick={() => onEditMission && onEditMission(m)}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Modifier la mission"
                    >
                      <IPencil />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                    <ICalendar /> {m.dates}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(m.skills || []).map((s: string) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                  <span className="font-serif text-lg font-bold text-foreground">{m.rate}€/h</span>
                  <button
                    onClick={() => {
                      setSelectedMissionId(m.id);
                      setTab("applicants");
                    }}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Voir les candidats <IArrow />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "applicants" && (
          <div className="flex flex-col gap-4">
            {/* Filtre mission */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Filtrer par mission :</span>
              <button
                onClick={() => setSelectedMissionId("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
                  selectedMissionId === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                Toutes les missions
              </button>
              {missions.map((m: Mission) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMissionId(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
                    String(selectedMissionId) === String(m.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {m.title}
                </button>
              ))}
            </div>

            {/* Cartes candidats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplicants.map((a: Applicant) => {
                const m = missions.find((item: Mission) => String(item.id) === String(a.missionId));

                return (
                  <div key={a.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 text-primary font-bold flex items-center justify-center text-sm">
                            {a.initials}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{a.name}</h4>
                            <p className="text-xs text-muted-foreground">{a.level}</p>
                          </div>
                        </div>
                        <MatchRing score={a.match} size={36} />
                      </div>

                      {m && (
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg mb-3">
                          Postule pour : <span className="font-medium text-foreground">{m.title}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                      <StatusBadge status={a.status} />
                      <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
                        Contacter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
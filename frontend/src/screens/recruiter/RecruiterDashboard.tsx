// ════════════════════════════════════════════════════════════
// screens/recruiter/RecruiterDashboard.tsx
// ────────────────────────────────────────────────────────────
// Espace recruteur : "Mes missions" et "Candidat·e·s".
// Version sécurisée contre les formats de dates issus de l'API.
// ════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import type { Mission, RecTab, Screen } from "../../types";
import { ALL_APPLICANTS } from "../../data/mockData";
import { BackBtn, MatchRing, SelectDropdown, StatusBadge, AppName } from "../../components/ui";
import { IArrow, ICalendar, IChevron, ILocation, IPencil, IPlus, ITrash } from "../../components/icons";

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "shortlisted", label: "Sélectionné·e" },
  { value: "interview", label: "Entretien planifié" },
  { value: "rejected", label: "Refusé·e" },
];

export function RecruiterDashboard({
  onNavigate,
  missions = [],
  onEditMission,
}: {
  onNavigate: (s: Screen) => void;
  missions: Mission[];
  onEditMission: (m: Mission) => void;
}) {
  const [tab, setTab] = useState<RecTab>("missions");
  const [expandedMissions, setExpandedMissions] = useState<string | number[]>([1]);
  const [applicantStatuses, setApplicantStatuses] = useState<Record<number, string>>(
    Object.fromEntries(ALL_APPLICANTS.map((a) => [a.id, a.status])),
  );

  // Tri sécurisé gérant aussi bien les objets Date que les chaînes ISO (string) reçues de l'API
  const sortedMissions = useMemo(() => {
    if (!Array.isArray(missions)) return [];
    
    return [...missions].sort((a, b) => {
      const dateA = a.sortDate ? new Date(a.sortDate).getTime() : 0;
      const dateB = b.sortDate ? new Date(b.sortDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [missions]);

  const toggleExpand = (id: any) => 
    setExpandedMissions((p: any) => (p.includes(id) ? p.filter((x: any) => x !== id) : [...p, id]));

  const updateStatus = (id: number, status: string) => 
    setApplicantStatuses((p) => ({ ...p, [id]: status }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-5 lg:px-8 pt-12 lg:pt-8 pb-5">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackBtn onClick={() => onNavigate("role-select")} />
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-0.5">Salon Éclat Paris</p>
              <AppName size="sm" />
            </div>
          </div>
          <button onClick={() => onNavigate("r-create")} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
            <IPlus />Nouveau
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="px-5 lg:px-8 mb-5">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-3 gap-3">
          {[
            { label: "Missions actives", value: String(missions.filter((m) => m.status === "open").length), color: "text-emerald-600" },
            { label: "Candidatures", value: String(ALL_APPLICANTS.length), color: "text-foreground" },
            { label: "Entretiens", value: String(Object.values(applicantStatuses).filter((s) => s === "interview").length), color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
              <p className={`font-serif text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto w-full flex gap-6">
          {(["missions", "applicants"] as RecTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 ${tab === t ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            >
              {t === "missions" ? "Mes missions" : "Candidat·e·s"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto w-full">
          {/* Onglet Missions */}
          {tab === "missions" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Triées par date — les plus proches en premier</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {sortedMissions.map((mission) => {
                  const missionApplicantCount = ALL_APPLICANTS.filter((a) => String(a.missionId) === String(mission.id)).length;
                  return (
                    <div key={mission.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-sm text-foreground">{mission.title}</p>
                              <StatusBadge status={mission.status} />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><ICalendar /><span>{mission.dates}</span></div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ILocation /><span className="truncate">{mission.location}</span></div>
                          </div>
                          <span className="font-serif text-lg text-foreground shrink-0">{mission.rate}€<span className="text-xs text-muted-foreground font-sans">/h</span></span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                          <span className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{missionApplicantCount}</span> candidature{missionApplicantCount !== 1 ? "s" : ""}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => onEditMission(mission)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all">
                              <IPencil /> Modifier
                            </button>
                            <button
                              onClick={() => { setTab("applicants"); setExpandedMissions([mission.id as any]); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                            >
                              Candidats <IArrow />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Onglet Candidat·e·s */}
          {tab === "applicants" && (
            <div className="flex flex-col gap-4 lg:max-w-3xl">
              {sortedMissions.map((mission) => {
                const mApplicants = ALL_APPLICANTS.filter((a) => String(a.missionId) === String(mission.id));
                if (mApplicants.length === 0) return null;
                const isExpanded = (expandedMissions as any[]).includes(mission.id);
                return (
                  <div key={mission.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                    <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors" onClick={() => toggleExpand(mission.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">{mission.title}</p>
                          <StatusBadge status={mission.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><ICalendar />{mission.dates}</span>
                          <span className="font-medium text-foreground">{mApplicants.length}</span> candidat{mApplicants.length > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}><IChevron /></div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border">
                        <div className="px-3 py-2 bg-muted/30"><p className="text-xs text-muted-foreground font-medium">Triés par score IA décroissant</p></div>
                        {[...mApplicants].sort((a, b) => b.match - a.match).map((applicant, idx) => (
                          <div key={applicant.id} className="p-4 border-t border-border/50">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${idx === 0 ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"}`}>{idx + 1}</div>
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent/60 flex items-center justify-center shrink-0"><span className="text-xs font-semibold text-foreground">{applicant.initials}</span></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-foreground">{applicant.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs text-muted-foreground">{applicant.level}</span>
                                  {applicant.availFrom && (
                                    <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/8 px-2 py-0.5 rounded-full">
                                      <ICalendar />{applicant.availFrom}{applicant.availTo ? ` → ${applicant.availTo}` : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <MatchRing score={applicant.match} size={44} />
                            </div>
                            <div className="flex items-center gap-2">
                              <SelectDropdown value={applicantStatuses[applicant.id]} onChange={(v) => updateStatus(applicant.id, v)} options={STATUS_OPTIONS} />
                              <StatusBadge status={applicantStatuses[applicant.id]} />
                              <button onClick={() => updateStatus(applicant.id, "rejected")} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors"><ITrash /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border px-5 lg:px-8 py-4 bg-card">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => onNavigate("role-select")} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">← Déconnexion</button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">{missions.filter((m) => m.status === "open").length} missions actives</span>
          </div>
        </div>
      </div>
    </div>
  );
}
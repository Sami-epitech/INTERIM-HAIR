/**
 * Écran d'édition et de mise à jour des paramètres d'une mission existante côté recruteur.
 */
import { useState } from "react";
import type { Mission, Screen } from "../../types";
import { SKILLS } from "../../data/mockData";
import { BackBtn, Input, StatusBadge } from "../../components/ui";

export function MissionEditScreen({
  mission,
  onNavigate,
  onSave,
}: {
  mission: Mission;
  onNavigate: (s: Screen) => void;
  onSave: (m: Mission) => void;
}) {
  const [title, setTitle] = useState(mission.title);
  const [description, setDescription] = useState(mission.description);
  const [location, setLocation] = useState(mission.location);
  const [rate, setRate] = useState(String(mission.rate));
  const [shift, setShift] = useState(mission.shift);
  const [startDate, setStartDate] = useState(mission.startDate);
  const [endDate, setEndDate] = useState(mission.endDate);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(mission.skills);
  const [status, setStatus] = useState<Mission["status"]>(mission.status);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSkill = (s: string) => setSelectedSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const handleSave = async (overrideStatus?: Mission["status"]) => {
    setErrorMsg(null);
    setLoading(true);

    const targetStatus = overrideStatus ?? status;

    const updatedMission: Mission = {
      ...mission,
      title,
      description,
      location,
      rate: Number(rate),
      shift,
      startDate,
      endDate,
      skills: selectedSkills,
      status: targetStatus,
      dates: endDate ? `${startDate || ""} – ${endDate}` : (startDate || ""),
    };

    try {
      const response = await fetch(`/api/jobs/${mission.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMission),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour de la mission.");
      }

      console.log("[RECRUTEUR] Mission mise à jour avec succès :", data);
      onSave(updatedMission);
      onNavigate("r-dashboard");

    } catch (err: any) {
      console.error("[RECRUTEUR] Erreur lors de la mise à jour de la mission :", err);
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      onSave(updatedMission);
      onNavigate("r-dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:max-w-2xl lg:mx-auto">
      {/* Modale de confirmation avant clôture définitive */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(45,31,26,0.5)" }}>
          <div className="bg-card rounded-2xl border border-border p-6 mx-5 flex flex-col gap-4 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-foreground">Clôturer la mission ?</h3>
            <p className="text-sm text-muted-foreground">Cette action marquera la mission comme terminée. Elle ne sera plus visible par les candidat·e·s.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">Annuler</button>
              <button 
                onClick={() => { setShowConfirm(false); handleSave("completed"); }} 
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {loading ? "..." : "Clôturer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-12 lg:pt-8 pb-5 flex items-center gap-3">
        <BackBtn onClick={() => onNavigate("r-dashboard")} />
        <div className="flex-1">
          <h1 className="font-serif text-2xl text-foreground">Modifier la mission</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{mission.title}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-6 flex flex-col gap-5">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <Input label="Intitulé du poste" value={title} onChange={setTitle} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:border-primary transition-colors resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Date de début</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground focus:border-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Date de fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground focus:border-primary transition-colors" />
          </div>
        </div>
        <Input label="Localisation" value={location} onChange={setLocation} />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Taux horaire (€)</label>
            <div className="relative">
              <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-card text-foreground text-sm focus:border-primary transition-colors" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€/h</span>
            </div>
          </div>
          <Input label="Horaires" value={shift} onChange={setShift} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/80 mb-2">Compétences</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${selectedSkills.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground/80">Statut de la mission</p>
          <div className="flex gap-2">
            {(["open", "filled"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${status === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
              >
                {s === "open" ? "Ouverte" : "Pourvue"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-red-100 bg-red-50/50">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Clôture définitive</p>
          <p className="text-xs text-red-600 mb-3">La mission sera marquée terminée et retirée des résultats de recherche.</p>
          <button type="button" onClick={() => setShowConfirm(true)} className="w-full py-3 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">Clôturer cette mission</button>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-background flex gap-3">
        <button type="button" onClick={() => onNavigate("r-dashboard")} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">Annuler</button>
        <button type="button" onClick={() => handleSave()} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
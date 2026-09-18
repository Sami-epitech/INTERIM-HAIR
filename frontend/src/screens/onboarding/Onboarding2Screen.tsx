// ════════════════════════════════════════════════════════════
// screens/onboarding/Onboarding2Screen.tsx
// ────────────────────────────────────────────────────────────
// Étape 3/3 (commune aux deux parcours upload/manuel) : préférences
// qui affinent les recommandations — compétences recherchées, zone
// géographique, disponibilités (dates + jours + horaires).
// Connecté à l'API Express Back-End.
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Screen } from "../../types";
import { SKILLS, DAYS, HOURS } from "../../data/mockData";
import { BackBtn, Divider, Input, PrimaryButton } from "../../components/ui";
import { ICalendar, IClock } from "../../components/icons";
import { formatDate } from "../../utils/format";

export function Onboarding2Screen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["CAP Coiffure", "Coloriste"]);
  const [experience, setExperience] = useState<"Débutant" | "Confirmé" | "Expert">("Confirmé");
  const [city, setCity] = useState("Paris");
  const [radius, setRadius] = useState(25);
  const [selectedDays, setSelectedDays] = useState<string[]>(["Lun", "Mar", "Mer", "Jeu", "Ven"]);
  const [startHour, setStartHour] = useState("9h");
  const [endHour, setEndHour] = useState("18h");
  const [availFrom, setAvailFrom] = useState("2026-09-15");
  const [availTo, setAvailTo] = useState("2026-12-31");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSkill = (s: string) => setSelectedSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleDay = (d: string) => setSelectedDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const startIdx = HOURS.indexOf(startHour);

  const dropStyle = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%239B8E85' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "36px",
  };

  // Soumission des préférences et disponibilités vers l'API Back-End Express
  const handleSavePreferences = async () => {
    console.log("👉 [FRONTEND] Envoi des préférences & disponibilités...");
    setErrorMsg(null);
    setLoading(true);

    const payload = {
      source: "preferences_onboarding",
      skills: selectedSkills,
      experienceLevel: experience,
      location: {
        city,
        radiusKm: radius,
      },
      availability: {
        from: availFrom,
        to: availTo,
        days: selectedDays,
        hours: {
          start: startHour,
          end: endHour,
        },
      },
    };

    console.log("📡 [FRONTEND] Payload envoyé à http://localhost:8000/api/profile :", payload);

    try {
      const response = await fetch("http://localhost:8000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement des préférences.");
      }

      console.log("✅ [FRONTEND] Préférences enregistrées avec succès :", data);

      // Navigation vers le fil d'offres (feed)
      onNavigate("feed");

    } catch (err: any) {
      console.error("❌ [FRONTEND] Erreur d'envoi des préférences :", err);
      setErrorMsg(err.message || "Impossible de contacter le serveur.");
      // Navigation de secours pour ne pas bloquer l'expérience utilisateur
      onNavigate("feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-12 lg:pt-4 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <BackBtn onClick={() => onNavigate("onboarding1")} />
          <div className="flex-1 flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
          </div>
        </div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Étape 3 sur 3</p>
        <h2 className="font-serif text-3xl text-foreground mb-1 leading-tight">Vos préférences</h2>
        <p className="text-sm text-muted-foreground">Ces informations affinent vos recommandations.</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-6 pb-6 flex flex-col gap-7">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Compétences recherchées</p>
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

        <Divider />

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Niveau d'expérience</p>
          <div className="flex gap-3">
            {(["Débutant", "Confirmé", "Expert"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setExperience(l)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-150 ${experience === l ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-foreground border-border hover:border-primary/40"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Zone de travail */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Zone de travail</p>
          <div className="mb-4">
            <Input label="Ville de référence" placeholder="ex. Paris, Lyon, Bordeaux…" value={city} onChange={setCity} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Distance maximale</label>
            <span className="font-mono text-sm font-medium text-primary">{radius} km</span>
          </div>
          <input type="range" min={5} max={100} step={5} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full h-2 rounded-full appearance-none" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5"><span>5 km</span><span>100 km</span></div>
          {city && (
            <p className="mt-2 text-xs text-muted-foreground">
              Missions dans un rayon de <span className="font-semibold text-foreground">{radius} km</span> autour de <span className="font-semibold text-foreground">{city}</span>
            </p>
          )}
        </div>

        <Divider />

        {/* Disponibilités */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-4">Disponibilités</p>

          <div className="bg-secondary/60 rounded-2xl border border-border p-4 mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Période de disponibilité</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">À partir du</label>
                <input type="date" value={availFrom} onChange={(e) => setAvailFrom(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Jusqu'au</label>
                <input type="date" value={availTo} onChange={(e) => setAvailTo(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:border-primary transition-colors" />
              </div>
            </div>
            {availFrom && availTo && (
              <div className="flex items-center gap-2 mt-3">
                <ICalendar />
                <span className="text-xs text-foreground font-medium">{formatDate(availFrom)} → {formatDate(availTo)}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2">Jours de travail</p>
          <div className="flex gap-1.5">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all duration-150 ${selectedDays.includes(d) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">Horaires préférés</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block">Début</label>
                <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium focus:border-primary transition-colors appearance-none cursor-pointer" style={dropStyle}>
                  {HOURS.slice(0, -1).map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-3"><span className="text-muted-foreground text-sm">→</span></div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block">Fin</label>
                <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium focus:border-primary transition-colors appearance-none cursor-pointer" style={dropStyle}>
                  {HOURS.slice(1).map((h) => <option key={h} value={h} disabled={HOURS.indexOf(h) <= startIdx}>{h}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-secondary border border-border/60">
              <div className="flex items-center gap-2">
                <IClock />
                <span className="text-xs text-foreground font-medium">
                  {selectedDays.length > 0 ? selectedDays.join(", ") : "Aucun jour"}
                  {selectedDays.length > 0 && ` · ${startHour} – ${endHour}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de validation connecté à handleSavePreferences */}
      <div className="px-6 pb-8 pt-4 border-t border-border bg-background" onClick={!loading ? handleSavePreferences : undefined}>
        <PrimaryButton disabled={loading}>
          {loading ? "Enregistrement..." : "Accéder aux offres →"}
        </PrimaryButton>
      </div>
    </div>
  );
}
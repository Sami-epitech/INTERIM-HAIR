// ════════════════════════════════════════════════════════════
// screens/recruiter/MissionCreateScreen.tsx
// ────────────────────────────────────────────────────────────
// Création d'une nouvelle mission, avec deux modes au choix :
// import d'une fiche de poste (à analyser par l'IA, comme le CV
// côté candidat) ou formulaire manuel.
//
// ⚠️ Pour l'instant, "Publier la mission" ne fait que revenir au
// dashboard SANS créer la mission (le formulaire n'est pas encore
// relié à l'état `missions` de App.tsx). C'est volontaire pour
// cette première version : à corriger en branchant un vrai
// `onCreate(mission)` une fois le backend prêt (POST /api/missions,
// voir backend/src/controllers/missions.controller.js → createMission()).
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Screen } from "../../types";
import { SKILLS } from "../../data/mockData";
import { BackBtn, Input } from "../../components/ui";
import { IUpload } from "../../components/icons";

export function MissionCreateScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [mode, setMode] = useState<"import" | "manual">("manual");
  const [title, setTitle] = useState("");
  const [rate, setRate] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["CAP Coiffure"]);

  const toggleSkill = (s: string) => setSelectedSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    // lg:max-w-2xl lg:mx-auto : contrairement au dashboard (qui a des
    // grilles à faire respirer), c'est un formulaire à une seule colonne —
    // le center-caper directement au lieu d'ajouter un wrapper interne
    // suffit ici, le fond bg-background étant le même que celui de la
    // page (pas de bordure/bg à faire déborder sur toute la largeur).
    <div className="min-h-screen bg-background flex flex-col lg:max-w-2xl lg:mx-auto">
      <div className="px-5 pt-12 lg:pt-8 pb-5 flex items-center gap-3">
        <BackBtn onClick={() => onNavigate("r-dashboard")} />
        <div>
          <h1 className="font-serif text-2xl text-foreground">Nouvelle mission</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Définissez votre offre d'emploi</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-6 flex flex-col gap-6">
        {/* Sélecteur de mode, façon "segmented control" */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["import", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {m === "import" ? "Importer une fiche" : "Formulaire manuel"}
            </button>
          ))}
        </div>

        {mode === "import" ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
            <div className="p-4 rounded-2xl bg-secondary"><IUpload /></div>
            <div>
              <p className="font-medium text-sm text-foreground">Glissez votre fiche de poste</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, Word, TXT — notre IA analyse et structure automatiquement</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">Parcourir les fichiers</button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <Input label="Intitulé du poste" placeholder="ex. Coiffeur Coloriste H/F" value={title} onChange={setTitle} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/80">Description</label>
              <textarea rows={4} placeholder="Décrivez les responsabilités…" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:border-primary transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80">Date de début</label>
                <input type="date" className="px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground focus:border-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80">Date de fin</label>
                <input type="date" className="px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground focus:border-primary transition-colors" />
              </div>
            </div>
            <Input label="Localisation du salon" placeholder="ex. 12 rue du Faubourg, Paris 8e" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground/80">Taux horaire (€)</label>
                <div className="relative">
                  <input type="number" placeholder="0.00" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:border-primary transition-colors" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€/h</span>
                </div>
              </div>
              <Input label="Horaires" placeholder="9h – 18h" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80 mb-2">Compétences requises</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${selectedSkills.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-border bg-background flex gap-3">
        <button onClick={() => onNavigate("r-dashboard")} className="flex-1 py-3.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">Annuler</button>
        <button onClick={() => onNavigate("r-dashboard")} className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Publier la mission</button>
      </div>
    </div>
  );
}

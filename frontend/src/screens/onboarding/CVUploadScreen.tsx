// ════════════════════════════════════════════════════════════
// screens/onboarding/CVUploadScreen.tsx
// ────────────────────────────────────────────────────────────
// Étape 2/3 (variante "import CV"). Trois sous-états gérés par
// `stage` :
//   1. "drop"    → zone de dépôt du fichier
//   2. "parsing" → simulation de l'analyse IA (setTimeout)
//   3. "review"  → relecture/correction des données extraites +
//                  envoi au Back-End Express lors de la validation.
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Screen } from "../../types";
import { DIPLOMAS_LIST } from "../../data/mockData";
import { BackBtn, PrimaryButton } from "../../components/ui";
import { IUpload, ICheck, IPencil, IX } from "../../components/icons";

export function CVUploadScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [stage, setStage] = useState<"drop" | "parsing" | "review">("drop");

  // Données extraites ou modifiées du CV
  const [exName, setExName] = useState("Marie Dupont");
  const [exDiploma, setExDiploma] = useState("BP Coiffure");
  const [exSkills, setExSkills] = useState(["CAP Coiffure", "Coloriste", "Balayage", "Visagisme"]);
  const [exLevel, setExLevel] = useState("Expert");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const removeSkill = (s: string) => setExSkills((p) => p.filter((x) => x !== s));
  const addSkill = () => {
    if (newSkill.trim() && !exSkills.includes(newSkill.trim())) {
      setExSkills((p) => [...p, newSkill.trim()]);
      setNewSkill("");
    }
  };

  // Soumission des données rebalayées/modifiées vers le Back-End Express
  const handleSaveProfile = async () => {
    console.log("👉 [FRONTEND] Envoi du profil extrait du CV...");
    setErrorMsg(null);
    setLoading(true);

    const userId = localStorage.getItem("userId") || undefined;
    const token = localStorage.getItem("auth_token") || undefined;

    const payload = {
      source: "cv_upload",
      userId,
      name: exName,
      diploma: exDiploma,
      skills: exSkills,
      experienceLevel: exLevel,
    };

    console.log("📡 [FRONTEND] Payload envoyé à http://localhost:8000/api/profile :", payload);

    try {
      const response = await fetch("http://localhost:8000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement du profil.");
      }

      console.log("✅ [FRONTEND] Profil CV enregistré avec succès par le serveur :", data);

      // Redirection vers l'étape suivante (Disponibilités/Préférences)
      onNavigate("onboarding2");

    } catch (err: any) {
      console.error("❌ [FRONTEND] Erreur lors de l'envoi du profil :", err);
      setErrorMsg(err.message || "Impossible de joindre le serveur.");
      // Permet de continuer la démo même si le serveur renvoie un souci temporaire
      onNavigate("onboarding2");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-12 lg:pt-4 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <BackBtn onClick={() => onNavigate("onboarding1")} />
        <div className="flex-1 flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-primary" />
          <div className="h-1 flex-1 rounded-full bg-primary" />
          <div className="h-1 flex-1 rounded-full bg-muted" />
        </div>
      </div>
      <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Étape 2 sur 3</p>
      <h2 className="font-serif text-3xl text-foreground mb-2 leading-tight">
        Importer
        <br />
        votre CV
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Notre IA analyse votre document et complète votre profil automatiquement.</p>

      {/* ── Étape "drop" : zone de dépôt du fichier ────────────── */}
      {stage === "drop" && (
        <>
          <div
            onClick={() => {
              setStage("parsing");
              setTimeout(() => setStage("review"), 2200);
            }}
            className="flex flex-col items-center justify-center gap-5 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/[0.02] cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 min-h-[220px] p-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
              <IUpload size={36} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Glissez votre CV ici</p>
              <p className="text-sm text-muted-foreground mt-1">ou appuyez pour parcourir vos fichiers</p>
            </div>
            <div className="flex gap-2">
              {["PDF", "Word", "TXT"].map((f) => (
                <span key={f} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">{f}</span>
              ))}
            </div>
          </div>
          <div className="mt-5 p-4 rounded-xl bg-secondary border border-border/60">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Extraction automatique :</span> diplômes, compétences, expériences — vérifiables et modifiables à l'étape suivante.
            </p>
          </div>
          <button onClick={() => onNavigate("manual-entry")} className="mt-4 text-sm text-muted-foreground text-center underline underline-offset-2 hover:text-foreground transition-colors">
            Préférer la saisie manuelle
          </button>
        </>
      )}

      {/* ── Étape "parsing" : simulation d'analyse IA ──────────── */}
      {stage === "parsing" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="animate-spin" width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#EDE8E3" strokeWidth="6" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="#C4697B" strokeWidth="6" strokeDasharray="251" strokeDashoffset="188" strokeLinecap="round" transform="rotate(-90 48 48)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 16h16M8 10h16M8 22h10" stroke="#C4697B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Analyse en cours…</p>
            <p className="text-sm text-muted-foreground mt-1">Notre IA lit votre CV</p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {["Extraction des diplômes", "Détection des compétences", "Analyse de l'expérience"].map((step) => (
              <div key={step} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Étape "review" : relecture/correction des données extraites ── */}
      {stage === "review" && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollable">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <ICheck />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">CV analysé avec succès</p>
              <p className="text-xs text-emerald-600">Vérifiez et corrigez si nécessaire</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <p className="text-sm font-semibold text-foreground">
            Données extraites — <span className="font-normal text-muted-foreground">appuyez sur ✏️ pour modifier</span>
          </p>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Nom complet */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">Nom complet</p>
                <button onClick={() => setEditingField(editingField === "name" ? null : "name")} className="text-primary"><IPencil /></button>
              </div>
              {editingField === "name" ? (
                <input
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-primary bg-background text-sm text-foreground focus:outline-none"
                  autoFocus
                  onBlur={() => setEditingField(null)}
                />
              ) : (
                <p className="text-sm font-semibold text-foreground">{exName}</p>
              )}
            </div>

            {/* Diplôme principal */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">Diplôme principal</p>
                <button onClick={() => setEditingField(editingField === "diploma" ? null : "diploma")} className="text-primary"><IPencil /></button>
              </div>
              {editingField === "diploma" ? (
                <div className="flex flex-col gap-1.5 mt-1">
                  {DIPLOMAS_LIST.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setExDiploma(d); setEditingField(null); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-left transition-all ${exDiploma === d ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border bg-background text-foreground"}`}
                    >
                      {d}
                      {exDiploma === d && <span className="text-primary"><ICheck /></span>}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/60 inline-block">{exDiploma}</span>
              )}
            </div>

            {/* Compétences */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">Compétences</p>
                <button onClick={() => setEditingField(editingField === "skills" ? null : "skills")} className="text-primary"><IPencil /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exSkills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/60">
                    {s}
                    {editingField === "skills" && (
                      <button onClick={() => removeSkill(s)} className="text-red-400 hover:text-red-600 ml-0.5"><IX /></button>
                    )}
                  </span>
                ))}
              </div>
              {editingField === "skills" && (
                <div className="flex gap-2 mt-3">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="Ajouter une compétence…"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <button onClick={addSkill} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">Ajouter</button>
                </div>
              )}
            </div>

            {/* Niveau d'expérience */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">Niveau d'expérience</p>
                <button onClick={() => setEditingField(editingField === "level" ? null : "level")} className="text-primary"><IPencil /></button>
              </div>
              {editingField === "level" ? (
                <div className="flex gap-2">
                  {["Débutant", "Confirmé", "Expert"].map((l) => (
                    <button
                      key={l}
                      onClick={() => { setExLevel(l); setEditingField(null); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${exLevel === l ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">{exLevel}</p>
              )}
            </div>
          </div>

          <div onClick={handleSaveProfile}>
            <PrimaryButton disabled={loading}>
              {loading ? "Enregistrement..." : "Confirmer et continuer →"}
            </PrimaryButton>
          </div>

          <button onClick={() => setStage("drop")} className="text-sm text-center text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
            Importer un autre fichier
          </button>
        </div>
      )}
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// screens/onboarding/ManualEntryScreen.tsx
// ────────────────────────────────────────────────────────────
// Étape 2/3 (variante "saisie manuelle") : formulaire complet du
// profil candidat. `canContinue` conditionne le bouton final —
// c'est une simple validation "tout ou rien" (pas de message
// d'erreur par champ pour l'instant, à ajouter si besoin plus tard).
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Screen } from "../../types";
import { SKILLS, DIPLOMAS_LIST } from "../../data/mockData";
import { BackBtn, Divider, Input, PrimaryButton } from "../../components/ui";

export function ManualEntryScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [diploma, setDiploma] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<"" | "Débutant" | "Confirmé" | "Expert">("");
  const [bio, setBio] = useState("");

  // Ajoute/retire une compétence de la sélection (tags cliquables multi-choix)
  const toggleSkill = (s: string) => setSelectedSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  // Champs obligatoires avant de pouvoir continuer (bio et téléphone restent optionnels)
  const canContinue = firstName && lastName && email && selectedSkills.length > 0 && experience;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-12 lg:pt-4 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <BackBtn onClick={() => onNavigate("onboarding1")} />
          <div className="flex-1 flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-muted" />
          </div>
        </div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Étape 2 sur 3</p>
        <h2 className="font-serif text-3xl text-foreground mb-1 leading-tight">Votre profil</h2>
        <p className="text-sm text-muted-foreground">Renseignez vos informations pour créer votre fiche candidat.</p>
      </div>

      {/* Contenu scrollable : le formulaire peut être plus grand que l'écran,
          seule cette zone défile (le bouton "Continuer" reste fixe en bas). */}
      <div className="flex-1 overflow-y-auto scrollable px-6 pb-6 flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-foreground">Identité</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" placeholder="Marie" value={firstName} onChange={setFirstName} />
            <Input label="Nom" placeholder="Dupont" value={lastName} onChange={setLastName} />
          </div>
          <Input label="Email" type="email" placeholder="marie@exemple.fr" value={email} onChange={setEmail} />
          <Input label="Téléphone" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={setPhone} />
        </div>

        <Divider />

        {/* Diplôme : choix unique parmi le référentiel DIPLOMAS_LIST */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Diplôme principal</p>
          <div className="flex flex-col gap-2">
            {DIPLOMAS_LIST.map((d) => (
              <button
                key={d}
                onClick={() => setDiploma(d)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${diploma === d ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border bg-card text-foreground hover:border-primary/40"}`}
              >
                {d}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${diploma === d ? "border-primary bg-primary" : "border-border"}`}>
                  {diploma === d && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Compétences : choix multiple parmi le référentiel SKILLS */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Compétences <span className="text-muted-foreground font-normal">(plusieurs choix)</span>
          </p>
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

        <Divider />

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Niveau d'expérience</p>
          <div className="flex gap-3">
            {(["Débutant", "Confirmé", "Expert"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setExperience(l)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-150 ${experience === l ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-foreground border-border hover:border-primary/40"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <p className="text-sm font-semibold text-foreground mb-2">
            Présentation <span className="text-muted-foreground font-normal">(optionnel)</span>
          </p>
          <textarea
            rows={4}
            placeholder="Quelques mots sur votre parcours…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>

      {/* Barre d'action fixe en bas, séparée du formulaire par une bordure */}
      <div className="px-6 pb-8 pt-4 border-t border-border bg-background">
        <PrimaryButton onClick={() => onNavigate("onboarding2")} disabled={!canContinue}>Continuer →</PrimaryButton>
      </div>
    </div>
  );
}

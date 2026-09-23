/**
 * Première étape du parcours d'inscription candidat : sélection de la méthode de saisie du profil.
 */
import { useState } from "react";
import type { Screen } from "../../types";
import { BackBtn, PrimaryButton } from "../../components/ui";
import { IUpload, IEdit } from "../../components/icons";

export function Onboarding1Screen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selected, setSelected] = useState<"upload" | "manual" | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-12 lg:pt-4 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <BackBtn onClick={() => onNavigate("auth")} />
        <div className="flex-1 flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-primary" />
          <div className="h-1 flex-1 rounded-full bg-muted" />
          <div className="h-1 flex-1 rounded-full bg-muted" />
        </div>
      </div>


      <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Étape 1 sur 3</p>
      <h2 className="font-serif text-3xl text-foreground mb-2 leading-tight">
        Créer votre
        <br />
        profil
      </h2>
      <p className="text-sm text-muted-foreground mb-8">Choisissez la méthode qui vous convient le mieux.</p>

      <div className="flex flex-col gap-4 flex-1">
        {[
          { key: "upload" as const, icon: <IUpload />, title: "Importer mon CV", desc: "PDF, Word — notre IA extrait vos compétences automatiquement.", badge: "Recommandé" },
          { key: "manual" as const, icon: <IEdit />, title: "Saisie manuelle", desc: "Remplissez votre profil étape par étape à votre rythme.", badge: null },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
              selected === opt.key ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-accent"
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${selected === opt.key ? "bg-primary/10" : "bg-secondary"}`}>{opt.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-foreground">{opt.title}</span>
                {opt.badge && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{opt.badge}</span>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{opt.desc}</p>
            </div>
            {/* Petit rond de sélection façon "radio button" custom */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selected === opt.key ? "border-primary bg-primary" : "border-border"}`}>
              {selected === opt.key && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={() => onNavigate(selected === "upload" ? "cv-upload" : "manual-entry")} disabled={!selected}>
          Continuer
        </PrimaryButton>
      </div>
    </div>
  );
}

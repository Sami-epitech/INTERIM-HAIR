// ════════════════════════════════════════════════════════════
// screens/candidate/JobDetailScreen.tsx
// ────────────────────────────────────────────────────────────
// Détail complet d'une offre + bouton de candidature.
// Connecté au Back-End Node.js (POST http://localhost:8000/api/applications)
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Job, Screen } from "../../types";
import { BackBtn, Divider, MatchRing, PrimaryButton, Tag } from "../../components/ui";
import { IClock, ILocation } from "../../components/icons";

export function JobDetailScreen({ job, onNavigate }: { job: Job; onNavigate: (s: Screen) => void }) {
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fonction d'envoi de la candidature au serveur Node.js
  const handleApply = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:8000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          candidateName: "Marie Dupont", // Données de démo candidat
          candidateEmail: "marie.dupont@example.com",
          message: `Candidature pour l'offre : ${job.title}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[TK-009] Candidature transmise avec succès :", data);
        setApplied(true);
      } else {
        console.error("Erreur lors de l'envoi de la candidature");
      }
    } catch (error) {
      console.error("Erreur de connexion au serveur Node.js :", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Photo du salon en bandeau + bouton retour flottant + score IA */}
      <div className="relative h-64 bg-muted overflow-hidden">
        <img src={job.image} alt={job.salon} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-12 left-4"><BackBtn onClick={() => onNavigate("feed")} /></div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md"><MatchRing score={job.match} size={56} /></div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 lg:px-8 pt-6 pb-32">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-xl text-foreground leading-tight">{job.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{job.salon}</p>
            </div>
            <span className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-foreground shrink-0">{job.contract}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
            <span className="flex items-center gap-1"><ILocation />{job.location}</span>
            <span className="flex items-center gap-1"><IClock />{job.shift}</span>
          </div>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="font-serif text-4xl text-foreground">{job.rate}€</span>
            <span className="text-sm text-muted-foreground">/heure brut</span>
          </div>

          <Divider />
          <div className="py-5">
            <h4 className="font-semibold text-sm text-foreground mb-3">Mission</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          <Divider />
          <div className="py-5">
            <h4 className="font-semibold text-sm text-foreground mb-3">Diplômes requis</h4>
            {job.diplomas.map((d) => (
              <div key={d} className="flex items-center gap-2 text-sm text-foreground mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {d}
              </div>
            ))}
          </div>

          <Divider />
          <div className="py-5">
            <h4 className="font-semibold text-sm text-foreground mb-3">Avantages</h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">✓ {b}</span>
              ))}
            </div>
          </div>

          <Divider />
          <div className="pt-5">
            <h4 className="font-semibold text-sm text-foreground mb-3">Compétences</h4>
            <div className="flex flex-wrap gap-2">{job.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
          </div>
        </div>
      </div>

      {/* Barre d'action fixe */}
      <div className="fixed bottom-0 left-0 right-0 px-5 lg:px-8 pb-8 pt-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto w-full">
          {applied ? (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-600 font-semibold text-sm">✓ Candidature envoyée !</span>
            </div>
          ) : (
            <PrimaryButton onClick={handleApply} disabled={submitting}>
              {submitting ? "Envoi en cours..." : "Confirmer ma candidature"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
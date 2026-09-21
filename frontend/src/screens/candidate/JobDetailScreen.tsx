// ════════════════════════════════════════════════════════════
// screens/candidate/JobDetailScreen.tsx
// ────────────────────────────────────────────────────────────
// Détail complet d'une offre + bouton de candidature. L'offre
// affichée (`job`) est passée en prop depuis App.tsx, qui la garde
// dans son état `selectedJob` (positionné par FeedScreen au clic
// sur "Postuler").
//
// TODO backend : le clic sur "Confirmer ma candidature" devra
// appeler POST /api/missions/:missionId/applications (voir
// backend/src/controllers/applications.controller.js → applyToMission())
// au lieu de se contenter de passer `applied` à true localement.
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Job, Screen } from "../../types";
import { BackBtn, Divider, MatchRing, PrimaryButton, Tag } from "../../components/ui";
import { IClock, IHeart, ILocation } from "../../components/icons";

export function JobDetailScreen({
  job,
  onNavigate,
  isFavorite = false,
  onToggleFavorite,
}: {
  job: Job;
  onNavigate: (s: Screen) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (j: Job) => void;
}) {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    const targetUrl =
      job.urlOrigine ||
      (job.id ? `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}` : "https://candidat.francetravail.fr/offres/recherche");

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Photo du salon en bandeau + bouton retour flottant + score IA */}
      <div className="relative h-64 bg-muted overflow-hidden">
        <img src={job.image} alt={job.salon} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-12 left-4"><BackBtn onClick={() => onNavigate("feed")} /></div>
        <div className="absolute top-12 right-4">
          <button
            onClick={() => onToggleFavorite && onToggleFavorite(job)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-md transition-colors"
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <IHeart filled={isFavorite} />
          </button>
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md"><MatchRing score={job.match} size={56} /></div>
      </div>

      {/* pb-32 : laisse la place pour la barre d'action fixe en bas (position: fixed).
          max-w-2xl mx-auto : le texte reste à une largeur confortable à lire même
          en grand écran (l'image du bandeau ci-dessus, elle, reste en plein bord). */}
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

      {/* Barre d'action fixe : bouton Postuler qui redirige vers l'offre France Travail (urlOrigine) */}
      <div className="fixed bottom-0 left-0 right-0 px-5 lg:px-8 pb-8 pt-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto w-full">
          {applied ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                ✓ Redirection vers France Travail effectuée !
              </span>
              <button
                onClick={handleApply}
                className="text-xs text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Réouvrir l'offre sur France Travail
              </button>
            </div>
          ) : (
            <PrimaryButton onClick={handleApply} className="flex items-center justify-center gap-2">
              <span>Postuler</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

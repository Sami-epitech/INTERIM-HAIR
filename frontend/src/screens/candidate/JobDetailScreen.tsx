// ════════════════════════════════════════════════════════════
// screens/candidate/JobDetailScreen.tsx
// ────────────────────────────────────────────────────────────
// Détail complet d'une offre + candidature :
// - Offre interne (Airtable / créée par un recruteur) :
//   Bouton "Candidater" qui passe au vert et enregistre la
//   candidature de l'intérimaire auprès du recruteur dans Airtable.
// - Offre externe (France Travail) :
//   Bouton "Postuler" avec redirection vers l'annonce France Travail.
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
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Détection si l'offre est interne (créée sur la plateforme par un recruteur dans Airtable)
  // vs offre externe du flux France Travail
  const isInternal = Boolean(
    job.isInternal ||
    (job.id &&
      String(job.id).startsWith("rec") &&
      (!job.urlOrigine || !job.urlOrigine.includes("francetravail.fr")))
  );

  // Candidature externe : redirection vers la page France Travail
  const handleExternalApply = () => {
    setApplied(true);
    const targetUrl =
      job.urlOrigine ||
      (job.id ? `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}` : "https://candidat.francetravail.fr/offres/recherche");

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  // Candidature interne : envoi des informations de l'intérimaire au recruteur dans Airtable
  const handleInternalApply = async () => {
    if (applied || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const candidateId = localStorage.getItem("userId") || undefined;
      const token = localStorage.getItem("auth_token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:8000/api/missions/${job.id}/applications`, {
        method: "POST",
        headers,
        body: JSON.stringify({ candidateId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erreur lors de l'envoi de la candidature.");
      }

      console.log(`✅ [FRONTEND] Candidature interne validée pour l'offre ${job.id}`);
      setApplied(true);
    } catch (err: any) {
      console.error("❌ Erreur lors de la candidature interne :", err);
      setErrorMessage(err.message || "Impossible de transmettre votre candidature.");
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

      {/* pb-32 : laisse la place pour la barre d'action fixe en bas (position: fixed). */}
      <div className="flex-1 overflow-y-auto scrollable px-5 lg:px-8 pt-6 pb-32">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {isInternal ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                    ★ Offre directe salon
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-800">
                    France Travail
                  </span>
                )}
              </div>
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
            {(job.diplomas || []).map((d) => (
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
              {(job.benefits || []).map((b) => (
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

      {/* Barre d'action fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 px-5 lg:px-8 pb-8 pt-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="max-w-2xl mx-auto w-full">
          {isInternal ? (
            /* ── Cas 1 : Offre interne créée par un recruteur sur la plateforme ── */
            <div>
              {applied ? (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 cursor-default transition-all duration-300"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Candidature envoyée !</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>Vos informations et coordonnées ont été transmises au recruteur.</span>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleInternalApply}
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-95 shadow-sm active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Transmission de votre profil...</span>
                      </>
                    ) : (
                      <>
                        <span>Candidater</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                  {errorMessage && (
                    <p className="text-xs text-destructive text-center mt-2 font-medium">
                      ⚠️ {errorMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── Cas 2 : Offre externe France Travail ── */
            applied ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                  ✓ Redirection vers France Travail effectuée !
                </span>
                <button
                  onClick={handleExternalApply}
                  className="text-xs text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  Réouvrir l'offre sur France Travail
                </button>
              </div>
            ) : (
              <PrimaryButton onClick={handleExternalApply} className="flex items-center justify-center gap-2">
                <span>Postuler</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </PrimaryButton>
            )
          )}
        </div>
      </div>
    </div>
  );
}

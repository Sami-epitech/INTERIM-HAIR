// ════════════════════════════════════════════════════════════
// components/candidate/FilterModal.tsx
// ────────────────────────────────────────────────────────────
// Panneau de filtres du fil d'offres, en "bottom sheet" (glisse
// depuis le bas de l'écran). Fonctionne avec un état local `local`
// distinct des filtres réellement appliqués (`filters` reçu en
// prop) : ça permet à l'utilisateur d'ajuster les curseurs sans
// que le fil se filtre en direct, et de tout annuler en fermant
// la modale sans cliquer sur "Appliquer".
// ════════════════════════════════════════════════════════════
import { useState } from "react";
import type { Filters } from "../../types";
import { Divider, Input } from "../ui";
import { IX } from "../icons";

export function FilterModal({
  filters,
  onApply,
  onClose,
}: {
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  // Copie locale éditable, initialisée avec les filtres actuellement actifs
  const [local, setLocal] = useState<Filters>({ ...filters });

  return (
    // Fond semi-transparent cliquable : cliquer en dehors du panneau ferme la modale
    // (stopPropagation sur le panneau lui-même empêche la fermeture si on clique DANS le panneau)
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(45,31,26,0.45)" }} onClick={onClose}>
      <div
        className="bg-background rounded-t-3xl border-t border-border px-6 pt-6 pb-10 flex flex-col gap-5 max-h-[80vh] overflow-y-auto scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">Filtres</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors">
            <IX />
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Type de contrat</p>
          <div className="flex gap-2 flex-wrap">
            {["Tous", "CDI", "CDD", "Freelance", "Intérim"].map((c) => (
              <button
                key={c}
                onClick={() => setLocal((f) => ({ ...f, contract: c }))}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${local.contract === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Ville</p>
          <Input placeholder="ex. Paris, Lyon…" value={local.location} onChange={(v) => setLocal((f) => ({ ...f, location: v }))} />
        </div>

        <Divider />

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Taux horaire minimum</p>
            <span className="font-mono text-sm font-medium text-primary">{local.rateMin}€/h</span>
          </div>
          <input type="range" min={10} max={30} step={1} value={local.rateMin} onChange={(e) => setLocal((f) => ({ ...f, rateMin: +e.target.value }))} className="w-full h-2 rounded-full appearance-none" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5"><span>10€</span><span>30€</span></div>
        </div>

        <Divider />

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Score IA minimum</p>
            <span className="font-mono text-sm font-medium text-primary">{local.matchMin}%</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={local.matchMin} onChange={(e) => setLocal((f) => ({ ...f, matchMin: +e.target.value }))} className="w-full h-2 rounded-full appearance-none" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5"><span>0%</span><span>100%</span></div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setLocal({ contract: "Tous", location: "", rateMin: 10, matchMin: 0 })}
            className="flex-1 py-3.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Réinitialiser
          </button>
          {/* Seul ce bouton répercute réellement `local` vers le parent (via onApply) */}
          <button
            onClick={() => { onApply(local); onClose(); }}
            className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

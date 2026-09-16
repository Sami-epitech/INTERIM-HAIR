// ════════════════════════════════════════════════════════════
// components/ui/MatchRing.tsx
// ────────────────────────────────────────────────────────────
// Petit anneau de progression en SVG affichant le score de
// compatibilité IA (ex. 94%) sur les offres et les candidat·e·s.
// Dessiné à la main en SVG plutôt qu'avec une librairie de charts
// car c'est juste un cercle avec un arc proportionnel au score.
// ════════════════════════════════════════════════════════════

export const MatchRing = ({ score, size = 48 }: { score: number; size?: number }) => {
  // Épaisseur du trait, rayon déduit de la taille totale pour que le
  // cercle tienne exactement dans le carré size×size, centre du cercle.
  const sw = 3.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r; // circonférence totale du cercle
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Piste de fond (cercle complet, gris clair) */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDE8E3" strokeWidth={sw} />

      {/* Arc de progression : on dessine un cercle complet mais on "cache"
          une portion via strokeDasharray/strokeDashoffset, proportionnelle
          au score. rotate(-90) pour que l'arc démarre en haut (12h) plutôt
          qu'à droite (position par défaut d'un cercle SVG). */}
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#C4697B" strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={circ - (score / 100) * circ}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* Le pourcentage écrit au centre de l'anneau */}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={size > 44 ? 11 : 9} fontWeight="600" fill="#2D1F1A" fontFamily="Outfit, sans-serif">
        {score}%
      </text>
    </svg>
  );
};

/**
 * Anneau de progression circulaire SVG affichant le pourcentage de compatibilité.
 */
export const MatchRing = ({ score, size = 48 }: { score: number; size?: number }) => {
  const sw = 3.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Cercle d'arrière-plan */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDE8E3" strokeWidth={sw} />

      {/* Arc de progression selon le score */}
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#C4697B" strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={circ - (score / 100) * circ}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* Libellé du score au centre */}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={size > 44 ? 11 : 9} fontWeight="600" fill="#2D1F1A" fontFamily="Outfit, sans-serif">
        {score}%
      </text>
    </svg>
  );
};

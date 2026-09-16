// ════════════════════════════════════════════════════════════
// components/ui/SelectDropdown.tsx
// ────────────────────────────────────────────────────────────
// <select> stylisé avec une flèche custom (le style natif du
// navigateur est désactivé via `appearance-none`, puis on redessine
// la flèche en arrière-plan CSS — un petit SVG encodé en data-URI).
// Utilisé notamment pour changer le statut d'un·e candidat·e
// (RecruiterDashboard).
// ════════════════════════════════════════════════════════════
export const SelectDropdown = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:border-primary transition-colors cursor-pointer appearance-none"
    style={{
      // Flèche custom dessinée en SVG (couleur muted-foreground #9B8E85),
      // positionnée à droite du champ — remplace la flèche native du <select>.
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%239B8E85' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center",
      paddingRight: "28px",
    }}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

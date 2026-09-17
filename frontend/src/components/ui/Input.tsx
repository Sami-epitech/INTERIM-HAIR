// ════════════════════════════════════════════════════════════
// components/ui/Input.tsx
// ────────────────────────────────────────────────────────────
// Champ de formulaire réutilisable (label + input + texte d'aide
// optionnel). Composant "contrôlé" : la valeur vit dans le state
// de l'écran parent (`value` + `onChange`), Input ne stocke rien
// lui-même — c'est ce qui permet, par exemple, à ManualEntryScreen
// de savoir si le formulaire est complet (canContinue) sans que
// Input ait besoin d'en avoir conscience.
// ════════════════════════════════════════════════════════════
export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  hint?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-foreground/80">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:border-primary transition-colors duration-200"
    />
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

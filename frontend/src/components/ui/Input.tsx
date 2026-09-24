import { useId } from "react";

/**
 * Champ de saisie contrôlé réutilisable avec libellé et indication optionnelle.
 */
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
}) => {
  const inputId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground/80"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:border-primary transition-colors duration-200"
      />

      {hint && (
        <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
};
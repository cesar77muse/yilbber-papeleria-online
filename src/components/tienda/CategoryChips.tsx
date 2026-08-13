import { categorias } from "./images";
import { cn } from "@/lib/utils";

export function CategoryChips({
  activa,
  onChange,
}: {
  activa: string;
  onChange: (id: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
      {categorias.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={activa === c.id}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              activa === c.id
                ? "border-brand-orange bg-brand-orange text-primary-foreground"
                : "border-brand-navy/15 bg-card text-brand-navy hover:border-brand-orange/60",
            )}
          >
            {c.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
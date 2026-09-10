import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { categorias } from "./images";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/productos.functions";

const VISIBLE_COUNT = 7;

export function CategoryChips({
  activa,
  onChange,
  productos,
}: {
  activa: string;
  onChange: (id: string) => void;
  productos: Producto[];
}) {
  const [expandido, setExpandido] = useState(false);

  const ordenadas = useMemo(() => {
    const conteos = new Map<string, number>();
    for (const p of productos) {
      conteos.set(p.category, (conteos.get(p.category) ?? 0) + 1);
    }
    const todos = categorias.filter((c) => c.id === "todos");
    const restoConDatos = categorias
      .filter((c) => c.id !== "todos" && (conteos.get(c.id) ?? 0) > 0)
      .sort((a, b) => (conteos.get(b.id) ?? 0) - (conteos.get(a.id) ?? 0));
    return [...todos, ...restoConDatos];
  }, [productos]);

  const visibles = useMemo(() => {
    if (expandido) return ordenadas;
    const base = ordenadas.slice(0, VISIBLE_COUNT);
    if (!base.some((c) => c.id === activa)) {
      const activaCat = ordenadas.find((c) => c.id === activa);
      if (activaCat) base.push(activaCat);
    }
    return base;
  }, [ordenadas, expandido, activa]);

  const hayMas = ordenadas.length > visibles.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
        {visibles.map((c) => (
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
      {(hayMas || expandido) && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          aria-expanded={expandido}
          className="inline-flex items-center gap-1 rounded-full border border-brand-navy/15 bg-card px-3 py-2 text-sm font-semibold text-brand-navy hover:border-brand-orange/60"
        >
          {expandido ? (
            <>
              Ver menos
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Ver más
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

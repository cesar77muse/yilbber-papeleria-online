import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { categorias } from "./images";
import { cn } from "@/lib/utils";

const VISIBLE_COUNT = 7;

const claseChip = (activa: boolean) =>
  cn(
    "block rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
    activa
      ? "border-brand-orange bg-brand-orange text-primary-foreground"
      : "border-brand-navy/15 bg-card text-brand-navy hover:border-brand-orange/60",
  );

/**
 * Chips de categoría como enlaces reales a /pedidos y /categoria/$id, para que
 * Google pueda seguirlos. Las que no caben quedan en el HTML pero ocultas
 * hasta "Ver más".
 */
export function CategoryChips({
  activa,
  conteos,
  q,
}: {
  activa: string;
  conteos: Record<string, number>;
  q?: string | undefined;
}) {
  const [expandido, setExpandido] = useState(false);

  const ordenadas = useMemo(
    () =>
      categorias
        .filter((c) => c.id !== "todos" && (conteos[c.id] ?? 0) > 0)
        .sort((a, b) => (conteos[b.id] ?? 0) - (conteos[a.id] ?? 0)),
    [conteos],
  );

  // "Todos" ocupa uno de los cupos visibles.
  const hayMas = ordenadas.length > VISIBLE_COUNT - 1;
  const search = q ? { q } : {};

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap gap-2" aria-label="Categorías">
        <li>
          <Link
            to="/pedidos"
            search={search}
            activeOptions={{ includeSearch: false }}
            aria-current={activa === "todos" ? "page" : undefined}
            className={claseChip(activa === "todos")}
          >
            Todos
          </Link>
        </li>
        {ordenadas.map((c, i) => (
          <li
            key={c.id}
            className={cn(!expandido && i >= VISIBLE_COUNT - 1 && activa !== c.id && "hidden")}
          >
            <Link
              to="/categoria/$id"
              params={{ id: c.id }}
              search={search}
              activeOptions={{ includeSearch: false }}
              aria-current={activa === c.id ? "page" : undefined}
              className={claseChip(activa === c.id)}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
      {hayMas && (
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

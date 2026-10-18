import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CategoryChips } from "./CategoryChips";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import { POR_PAGINA, type PaginaCatalogo } from "@/lib/productos.functions";

/** Parámetros de /pedidos y /categoria/$id: ?pagina=N&q=texto. */
export type BusquedaCatalogo = { pagina?: number | undefined; q?: string | undefined };

export function validarBusquedaCatalogo(search: Record<string, unknown>): BusquedaCatalogo {
  const pagina = Number(search["pagina"]);
  // El router convierte ?q=123 en número, así que se acepta también.
  const crudo = search["q"];
  const q =
    typeof crudo === "string" || typeof crudo === "number" ? String(crudo).slice(0, 100) : "";
  return {
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : undefined,
    q: q.trim() ? q : undefined,
  };
}

/** Ruta del listado, para armar los enlaces de paginación y la búsqueda. */
export type RutaCatalogo = { to: "/pedidos" } | { to: "/categoria/$id"; params: { id: string } };

export function Catalogo({
  datos,
  q,
  ruta,
  activa,
  titulo,
}: {
  datos: PaginaCatalogo;
  q: string | undefined;
  ruta: RutaCatalogo;
  activa: string;
  titulo: string;
}) {
  const { productos, total, pagina, paginas } = datos;
  const desde = (pagina - 1) * POR_PAGINA + 1;

  return (
    <>
      <div className="mt-8 space-y-4">
        <BusquedaEnUrl q={q} ruta={ruta} />
        <CategoryChips activa={activa} conteos={datos.conteos} q={q} />
      </div>

      <h2 className="mt-10 text-xl uppercase text-brand-navy md:text-2xl">{titulo}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {total === 0
          ? "0 productos"
          : paginas > 1
            ? `${desde}–${desde + productos.length - 1} de ${total} productos`
            : `${total} ${total === 1 ? "producto" : "productos"}`}
      </p>

      {productos.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-brand-orange/50 p-12 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-brand-orange/60" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">
            {q
              ? "No encontramos productos con esa búsqueda. Escríbenos por WhatsApp y te ayudamos."
              : "Aún no hay productos publicados aquí. Vuelve muy pronto o escríbenos por WhatsApp."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} paginas={paginas} q={q} ruta={ruta} />
    </>
  );
}

/**
 * Buscador que guarda el texto en ?q= (con una pausa corta para no pedir una
 * página por cada tecla) y vuelve a la página 1.
 */
function BusquedaEnUrl({ q, ruta }: { q: string | undefined; ruta: RutaCatalogo }) {
  const navigate = useNavigate();
  const [valor, setValor] = useState(q ?? "");
  const enviado = useRef(q ?? "");
  const rutaActual = useRef(ruta);
  rutaActual.current = ruta;

  // Si ?q= cambia por fuera (atrás/adelante, un chip), se refleja en la caja;
  // pero no cuando es la respuesta a lo que ya se escribió.
  useEffect(() => {
    if ((q ?? "") !== enviado.current) {
      enviado.current = q ?? "";
      setValor(q ?? "");
    }
  }, [q]);

  useEffect(() => {
    if (valor === enviado.current) return;
    const t = setTimeout(() => {
      enviado.current = valor;
      void navigate({
        ...rutaActual.current,
        search: { q: valor.trim() ? valor : undefined },
        replace: true,
        resetScroll: false,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [valor, navigate]);

  return <SearchBar valor={valor} onChange={setValor} />;
}

/** Números a mostrar: 1 … 4 5 6 … 18 */
function numerosDePagina(pagina: number, paginas: number): (number | "…")[] {
  const set = new Set([1, paginas, pagina - 1, pagina, pagina + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= paginas).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1]! > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function Paginacion({
  pagina,
  paginas,
  q,
  ruta,
}: {
  pagina: number;
  paginas: number;
  q: string | undefined;
  ruta: RutaCatalogo;
}) {
  if (paginas <= 1) return null;

  const search = (n: number) => ({ q, pagina: n > 1 ? n : undefined });
  const base =
    "inline-flex min-w-10 items-center justify-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold";
  const normal = "border-brand-navy/15 bg-card text-brand-navy hover:border-brand-orange/60";

  return (
    <nav
      aria-label="Páginas del catálogo"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {pagina > 1 && (
        <Link
          {...ruta}
          activeOptions={{ exact: true }}
          search={search(pagina - 1)}
          rel="prev"
          className={cn(base, normal)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </Link>
      )}
      {numerosDePagina(pagina, paginas).map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={n}
            {...ruta}
            activeOptions={{ exact: true }}
            search={search(n)}
            aria-label={`Página ${n}`}
            aria-current={n === pagina ? "page" : undefined}
            className={cn(
              base,
              n === pagina ? "border-brand-orange bg-brand-orange text-primary-foreground" : normal,
            )}
          >
            {n}
          </Link>
        ),
      )}
      {pagina < paginas && (
        <Link
          {...ruta}
          activeOptions={{ exact: true }}
          search={search(pagina + 1)}
          rel="next"
          className={cn(base, normal)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

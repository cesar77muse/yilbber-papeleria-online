import { Search, X } from "lucide-react";

export function SearchBar({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-orange"
        aria-hidden="true"
      />
      <input
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar cuadernos, esferos, resmas…"
        aria-label="Buscar productos"
        className="w-full rounded-full border border-brand-navy/15 bg-card py-3.5 pl-12 pr-12 text-base text-brand-navy shadow-sm outline-none placeholder:text-muted-foreground focus:border-brand-orange"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:text-brand-navy"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
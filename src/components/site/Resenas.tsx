import { Star, Quote, ExternalLink } from "lucide-react";
import { GOOGLE_RESENAS, resenas } from "./data";

export function Resenas() {
  return (
    <section id="resenas" className="bg-accent/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl uppercase text-brand-navy md:text-4xl">
          Lo que dicen nuestros clientes
        </h2>
        <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />

        <a
          href={GOOGLE_RESENAS.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-brand-navy/10 bg-card px-4 py-3 shadow-sm transition-colors hover:border-brand-orange/40"
        >
          <span className="text-2xl font-bold text-brand-navy">
            {GOOGLE_RESENAS.calificacion.toLocaleString("es-CO", { minimumFractionDigits: 1 })}
          </span>
          <span
            className="flex gap-0.5"
            aria-label={`${GOOGLE_RESENAS.calificacion} de 5 estrellas`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 text-brand-orange ${
                  i < Math.round(GOOGLE_RESENAS.calificacion) ? "fill-brand-orange" : ""
                }`}
                aria-hidden="true"
              />
            ))}
          </span>
          <span className="text-sm text-muted-foreground">
            {GOOGLE_RESENAS.total} reseñas en Google
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy">
            Ver en Google
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </a>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {resenas.map((r) => (
            <figure
              key={r.nombre}
              className="relative rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm"
            >
              <Quote
                className="absolute right-5 top-5 h-8 w-8 text-brand-orange/20"
                aria-hidden="true"
              />
              <div className="flex gap-1" aria-label={`${r.estrellas} de 5 estrellas`}>
                {Array.from({ length: r.estrellas }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-brand-orange text-brand-orange"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-muted-foreground">
                “{r.texto}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-bold uppercase text-brand-navy">
                {r.nombre}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

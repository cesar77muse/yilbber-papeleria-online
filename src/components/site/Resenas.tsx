import { Star, Quote } from "lucide-react";
import { resenas } from "./data";

export function Resenas() {
  return (
    <section id="resenas" className="bg-accent/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl uppercase text-brand-navy md:text-4xl">Lo que dicen nuestros clientes</h2>
        <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {resenas.map((r) => (
            <figure
              key={r.nombre}
              className="relative rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-orange/20" aria-hidden="true" />
              <div className="flex gap-1" aria-label={`${r.estrellas} de 5 estrellas`}>
                {Array.from({ length: r.estrellas }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-orange text-brand-orange" aria-hidden="true" />
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
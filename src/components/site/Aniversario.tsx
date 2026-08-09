import aniversario from "@/assets/aniversario-40-yilbber.jpg.asset.json";

export function Aniversario() {
  return (
    <section className="bg-brand-navy py-16 text-secondary-foreground md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <h2 className="text-2xl uppercase md:text-4xl">40 años en busca de la excelencia</h2>
          <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
          <p className="font-script mt-6 text-3xl text-brand-orange-soft md:text-4xl">
            Gracias por ser parte de esta historia.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-secondary-foreground/80">
            Cuatro décadas acompañando a estudiantes, familias, colegios y empresas de Duitama y
            Boyacá. Seguimos creciendo con la misma cercanía del primer día.
          </p>
          <p className="font-script mt-4 text-2xl text-secondary-foreground">
            Escribiendo nuestra historia, creciendo contigo.
          </p>
        </div>

        <figure className="overflow-hidden rounded-3xl border-4 border-brand-orange/70 shadow-2xl">
          <img
            src={aniversario.url}
            alt="Afiche conmemorativo de los 40 años de Publigráficas Yilbber"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
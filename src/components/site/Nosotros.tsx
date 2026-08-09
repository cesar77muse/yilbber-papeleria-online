const indicadores = [
  { valor: "40", texto: "años de experiencia" },
  { valor: "2", texto: "sedes en Duitama" },
  { valor: "+1.000", texto: "referencias en portafolio" },
  { valor: "Mayorista", texto: "para colegios y empresas" },
];

export function Nosotros() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className="text-2xl uppercase text-brand-navy md:text-4xl">Quiénes somos</h2>
      <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />

      <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Papelería Yilbber es un negocio dedicado a la comercialización de productos de papelería,
            útiles escolares y artículos de oficina, con una amplia variedad de productos para
            estudiantes, familias, profesionales y empresas.
          </p>
          <p>
            Contamos con dos sedes en Duitama, Boyacá, donde nuestros clientes encuentran todo lo
            necesario para sus actividades académicas, laborales y personales: cuadernos, carpetas,
            lápices, esferos, agendas, artículos de escritorio, materiales escolares y diversos
            productos de oficina y papelería.
          </p>
          <p>
            Buscamos brindar una atención cercana y un servicio confiable, facilitando que nuestros
            clientes encuentren en un solo lugar los productos que necesitan para estudiar, trabajar,
            organizarse y desarrollar sus actividades del día a día.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {indicadores.map((i) => (
            <div
              key={i.texto}
              className="rounded-2xl border border-brand-navy/10 bg-card p-5 shadow-sm"
            >
              <p className="text-2xl text-brand-orange md:text-3xl">{i.valor}</p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">{i.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
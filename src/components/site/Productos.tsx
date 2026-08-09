import cuadernos from "@/assets/cat-cuadernos.jpg";
import escolares from "@/assets/cat-escolares.jpg";
import oficina from "@/assets/cat-oficina.jpg";
import { whatsappUrl } from "./data";

const destacadas = [
  {
    img: cuadernos,
    titulo: "Cuadernos y agendas",
    texto: "Cuadernos argollados, cosidos, agendas y libretas en todos los tamaños.",
  },
  {
    img: escolares,
    titulo: "Útiles escolares",
    texto: "Lápices, colores, marcadores, tijeras, reglas y todo para la lista escolar.",
  },
  {
    img: oficina,
    titulo: "Artículos de oficina",
    texto: "Ganchos, cosedoras, notas adhesivas, carpetas y archivo.",
  },
];

const otras = [
  "Carpetas y archivo",
  "Lápices y esferos",
  "Artículos de escritorio",
  "Papel y resmas",
  "Materiales para manualidades",
  "Venta al por mayor para colegios y empresas",
];

export function Productos() {
  return (
    <section id="productos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className="text-2xl uppercase text-brand-navy md:text-4xl">Nuestro portafolio</h2>
      <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
      <p className="mt-4 max-w-2xl text-base text-muted-foreground">
        Una selección de lo que encuentras en nuestras sedes. El inventario es mucho más amplio:
        consúltanos en tienda o por WhatsApp.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {destacadas.map((c) => (
          <article
            key={c.titulo}
            className="overflow-hidden rounded-3xl border border-brand-navy/10 bg-card shadow-sm transition-shadow hover:shadow-lg"
          >
            <img
              src={c.img}
              alt={c.titulo}
              loading="lazy"
              width={1024}
              height={768}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <h3 className="text-lg uppercase text-brand-navy">{c.titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.texto}</p>
            </div>
          </article>
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap gap-3">
        {otras.map((o) => (
          <li
            key={o}
            className="rounded-full border border-brand-orange/40 bg-accent px-4 py-2 text-sm font-semibold text-brand-navy"
          >
            {o}
          </li>
        ))}
      </ul>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-8 inline-flex rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.03]"
      >
        Consultar disponibilidad
      </a>
    </section>
  );
}
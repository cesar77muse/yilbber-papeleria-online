import { MessageCircle, ArrowRight } from "lucide-react";
import { whatsappUrl } from "./data";
import cuadernos from "@/assets/cat-cuadernos.jpg";
import escolares from "@/assets/cat-escolares.jpg";
import oficina from "@/assets/cat-oficina.jpg";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 -top-28 h-40 rounded-b-[100%] bg-brand-orange/90"
        aria-hidden="true"
      />
      <div className="confetti-bg relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-24 md:grid-cols-[1.05fr_0.95fr] md:pb-24 md:pt-28">
        <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange md:text-sm">
          Distribuidor mayorista de productos escolares y de oficina
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl leading-tight text-brand-navy uppercase md:text-5xl md:leading-[1.05]">
          Todo lo que necesitas para estudiar, trabajar y organizarte, en un solo lugar
        </h1>
        <p className="font-script mt-4 text-2xl text-brand-orange md:text-3xl">
          Escribiendo nuestra historia, creciendo contigo.
        </p>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Papelería Yilbber atiende a estudiantes, familias, profesionales y empresas en Duitama,
          Boyacá, con dos sedes y un portafolio amplio de papelería, útiles escolares y artículos de
          oficina.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Escríbenos por WhatsApp
          </a>
          <a
            href="#productos"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-secondary-foreground"
          >
            Ver productos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 md:gap-4">
          <img
            src={cuadernos}
            alt="Cuadernos y agendas disponibles en Papelería Yilbber"
            loading="lazy"
            width={1024}
            height={768}
            className="col-span-2 h-44 w-full rounded-3xl border border-brand-navy/10 object-cover shadow-md md:h-56"
          />
          <img
            src={escolares}
            alt="Útiles escolares: lápices, colores y marcadores"
            loading="lazy"
            width={1024}
            height={768}
            className="h-32 w-full rounded-3xl border border-brand-navy/10 object-cover shadow-md md:h-40"
          />
          <img
            src={oficina}
            alt="Artículos de oficina y archivo"
            loading="lazy"
            width={1024}
            height={768}
            className="h-32 w-full rounded-3xl border border-brand-navy/10 object-cover shadow-md md:h-40"
          />
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-brand-navy/15 bg-card px-5 py-3 shadow-lg">
            <span className="text-4xl text-brand-orange">40</span>
            <span className="text-xs font-semibold uppercase leading-tight text-brand-navy">
              años
              <br />
              en busca de la excelencia
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
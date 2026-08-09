import { MessageCircle, ArrowRight } from "lucide-react";
import { whatsappUrl } from "./data";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 -top-28 h-40 rounded-b-[100%] bg-brand-orange/90"
        aria-hidden="true"
      />
      <div className="confetti-bg relative mx-auto max-w-6xl px-4 pb-16 pt-24 md:pb-24 md:pt-28">
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

          <div className="ml-auto hidden items-center gap-3 rounded-2xl border border-brand-navy/15 bg-card px-5 py-3 shadow-sm md:flex">
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
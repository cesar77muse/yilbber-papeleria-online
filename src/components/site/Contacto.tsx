import { MapPin, Phone, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { sedes, EMAIL, whatsappUrl } from "./data";

export function Contacto() {
  return (
    <section id="contacto" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className="text-2xl uppercase text-brand-navy md:text-4xl">Contacto y sedes</h2>
      <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
      <p className="mt-4 max-w-2xl text-base text-muted-foreground">
        Visítanos en Duitama, Boyacá, o escríbenos y te asesoramos con tu pedido.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {sedes.map((s) => (
          <article key={s.nombre} className="rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm">
            <h3 className="text-lg uppercase text-brand-navy">{s.nombre}</h3>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
              <span>
                {s.direccion}
                <br />
                {s.ciudad}
              </span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {s.telefonos.map((t) => (
                <li key={t.tel}>
                  <a
                    href={`tel:${t.tel}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange"
                  >
                    <Phone className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={s.maps}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:underline"
            >
              Ver en Google Maps
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Escribir por WhatsApp
        </a>
        <a
          href={`mailto:${EMAIL}`}
          className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-secondary-foreground"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          {EMAIL}
        </a>
      </div>
    </section>
  );
}
import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, ExternalLink, Send } from "lucide-react";
import { sedes, EMAIL, whatsappUrl } from "./data";

export function Contacto() {
  const [enviado, setEnviado] = useState(false);

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setEnviado(true);
        }}
        className="mt-10 rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm md:p-8"
      >
        <h3 className="text-lg uppercase text-brand-navy">Envíanos un mensaje</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Cuéntanos qué necesitas y te responderemos lo antes posible.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="text-sm font-semibold text-brand-navy">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              placeholder="Tu nombre"
              className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <div>
            <label htmlFor="correo" className="text-sm font-semibold text-brand-navy">
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="mensaje" className="text-sm font-semibold text-brand-navy">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              required
              rows={4}
              placeholder="Escribe tu mensaje o el listado de productos que necesitas"
              className="mt-1.5 w-full resize-y rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.03]"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Enviar
          </button>
          {enviado && (
            <p role="status" className="text-sm font-semibold text-brand-orange">
              ¡Gracias! El envío de mensajes estará disponible próximamente. Por ahora escríbenos
              por WhatsApp.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
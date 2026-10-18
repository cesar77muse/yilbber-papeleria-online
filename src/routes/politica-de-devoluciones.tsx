import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EMAIL, sedes, whatsappUrl } from "@/components/site/data";
import { canonical } from "@/lib/seo";

// Google Merchant Center exige una política de devoluciones pública y que
// coincida con lo que se configura allá. Si cambian las condiciones, cambiar
// las dos cosas.
const ACTUALIZADA = "17 de octubre de 2026";

const title = "Política de cambios y devoluciones | Papelería Yilbber";
const description =
  "Cambios y devoluciones en Papelería Yilbber, Duitama: plazos, condiciones, derecho de retracto en compras en línea, garantía y reembolsos.";

export const Route = createFileRoute("/politica-de-devoluciones")({
  head: () => {
    const { meta, links } = canonical("/politica-de-devoluciones");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...meta,
      ],
      links,
    };
  },
  component: PoliticaDevoluciones,
});

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg uppercase text-brand-navy md:text-xl">{titulo}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function PoliticaDevoluciones() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <h1 className="mt-5 text-2xl uppercase text-brand-navy md:text-4xl">
          Política de cambios y devoluciones
        </h1>
        <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
        <p className="mt-4 text-sm text-muted-foreground">Última actualización: {ACTUALIZADA}</p>

        <Seccion titulo="Revisa tus productos al recibirlos">
          <p>
            Antes de entregar un pedido revisamos que cada producto esté completo y en buen estado:
            no entregamos productos dañados. Por eso te pedimos revisar tu compra en el momento en
            que la recibes, ya sea en la tienda, al recoger tu pedido o cuando llega el domicilio.
          </p>
          <p>
            Si algo no está bien (un producto que no corresponde, una cantidad incompleta o un
            artículo en mal estado), avísanos de inmediato a quien te entrega o por WhatsApp y lo
            solucionamos.
          </p>
        </Seccion>

        <Seccion titulo="Plazo para cambios y devoluciones">
          <p>
            Los cambios y devoluciones se reciben <strong>el mismo día de la compra</strong> o, en
            pedidos con domicilio, el mismo día de la entrega, en cualquiera de nuestras sedes y en
            horario de atención.
          </p>
          <p>Para aceptar un cambio o devolución el producto debe estar:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Sin usar, sin marcar y en las mismas condiciones en que lo recibiste.</li>
            <li>Con su empaque, etiquetas y accesorios originales.</li>
            <li>
              Acompañado de la factura o del número de pedido (por ejemplo, <em>YB-01234</em>).
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="Productos que no tienen cambio ni devolución">
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Productos dañados, rotos o deteriorados después de la entrega, por golpes, mal uso,
              humedad o desgaste.
            </li>
            <li>Productos usados, marcados, abiertos o sin su empaque original.</li>
            <li>Tintas, cartuchos, pegantes y pinturas que ya fueron abiertos.</li>
            <li>
              Trabajos personalizados o hechos a la medida, como impresiones, sellos o productos
              marcados con tu nombre o diseño.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="Compras en línea: derecho de retracto">
          <p>
            En los pedidos hechos y pagados a través de este sitio web, la ley colombiana (artículo
            47 de la Ley 1480 de 2011, Estatuto del Consumidor) te da derecho a retractarte de la
            compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la entrega.
          </p>
          <p>
            Para ejercerlo, el producto debe devolverse sin usar, en su empaque original y en las
            mismas condiciones en que lo recibiste. Los costos de transporte de la devolución corren
            por tu cuenta. No aplica para los productos personalizados o hechos a la medida.
          </p>
        </Seccion>

        <Seccion titulo="Garantía por defectos de fábrica">
          <p>
            Si un producto presenta un defecto de fábrica, aplica la garantía legal. Escríbenos con
            el número de pedido o la factura y una foto del defecto; según el caso, lo cambiamos por
            uno igual, lo reemplazamos por otro de valor similar o te devolvemos el dinero.
          </p>
        </Seccion>

        <Seccion titulo="Reembolsos">
          <p>
            Cuando una devolución es aceptada, primero te ofrecemos cambiar el producto por otro de
            igual o mayor valor (pagando la diferencia). Si prefieres el reembolso, te devolvemos el
            dinero por el mismo medio con que pagaste:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Pagos en línea con ePayco</strong> (tarjeta o PSE): se reversa a la misma
              tarjeta o cuenta. El tiempo en que lo veas reflejado depende de tu banco.
            </li>
            <li>
              <strong>Transferencia Nequi:</strong> se devuelve al mismo número de Nequi desde el
              que se hizo el pago.
            </li>
            <li>
              <strong>Pago en efectivo en la tienda:</strong> se devuelve en efectivo en la sede.
            </li>
          </ul>
          <p>
            Hacemos el reembolso a más tardar dentro de los 30 días calendario siguientes a la
            aceptación de la devolución. El costo del domicilio no es reembolsable, salvo que el
            error haya sido nuestro.
          </p>
        </Seccion>

        <Seccion titulo="Cómo solicitar un cambio o devolución">
          <p>
            Acércate a cualquiera de nuestras sedes con el producto y la factura o el número de
            pedido, o escríbenos primero para coordinarlo:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            {sedes.map((s) => (
              <li key={s.nombre}>
                <strong>{s.nombre}:</strong> {s.direccion}, {s.ciudad}
              </li>
            ))}
            <li>
              WhatsApp:{" "}
              <a
                href={whatsappUrl}
                className="font-semibold text-brand-navy underline hover:text-brand-orange"
              >
                321 451 2343
              </a>
            </li>
            <li>
              Correo:{" "}
              <a
                href={`mailto:${EMAIL}`}
                className="font-semibold text-brand-navy underline hover:text-brand-orange"
              >
                {EMAIL}
              </a>
            </li>
          </ul>
        </Seccion>
      </main>
      <Footer />
    </div>
  );
}

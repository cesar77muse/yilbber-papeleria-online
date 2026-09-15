import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CircleCheck, CircleX, Clock, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WHATSAPP } from "@/components/site/data";
import { formatoCOP } from "@/components/tienda/images";
import { useCartStore } from "@/stores/cartStore";
import { verificarPagoEpayco } from "@/lib/pagos.functions";
import type { PagoAplicado } from "@/lib/epayco.server";

export const Route = createFileRoute("/pago/respuesta")({
  // ePayco vuelve con ?ref_payco=...; según la referencia llega como texto o número.
  validateSearch: (search: Record<string, unknown>): { ref_payco?: string } => {
    const ref = search["ref_payco"] ?? search["x_ref_payco"];
    return typeof ref === "string" || typeof ref === "number" ? { ref_payco: String(ref) } : {};
  },
  head: () => ({
    meta: [
      { title: "Resultado del pago | Papelería Yilbber" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RespuestaPago,
});

type Estado =
  { tipo: "cargando" } | { tipo: "error"; mensaje: string } | { tipo: "listo"; pago: PagoAplicado };

/** Estados en los que el pago ya entró (después la papelería sigue moviendo el pedido). */
const PAGADO = ["pago_confirmado", "alistando", "listo", "entregado"];

function RespuestaPago() {
  const { ref_payco: ref } = Route.useSearch();
  const clearCart = useCartStore((s) => s.clearCart);
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  const consultar = useCallback(async () => {
    if (!ref) {
      setEstado({ tipo: "error", mensaje: "No recibimos la referencia del pago." });
      return;
    }
    setEstado({ tipo: "cargando" });
    try {
      const pago = await verificarPagoEpayco({ data: { ref } });
      setEstado({ tipo: "listo", pago });
      // Aprobado o en proceso: el pedido ya quedó guardado. Si no se pagó, el
      // carrito se conserva para intentarlo otra vez.
      if (PAGADO.includes(pago.status) || pago.status === "pendiente_pago") clearCart();
    } catch (e) {
      setEstado({
        tipo: "error",
        mensaje: e instanceof Error && e.message ? e.message : "No pudimos consultar tu pago.",
      });
    }
  }, [ref, clearCart]);

  useEffect(() => {
    void consultar();
  }, [consultar]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-16 text-center md:py-24">
        {estado.tipo === "cargando" && (
          <div>
            <Loader2
              className="mx-auto h-10 w-10 animate-spin text-brand-orange"
              aria-hidden="true"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Estamos confirmando tu pago con ePayco…
            </p>
          </div>
        )}

        {estado.tipo === "error" && (
          <div>
            <CircleX className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-2xl uppercase text-brand-navy">
              No pudimos confirmar tu pago
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{estado.mensaje}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {ref && (
                <BotonSecundario onClick={() => void consultar()}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Consultar de nuevo
                </BotonSecundario>
              )}
              <BotonWhatsApp mensaje="Hola Papelería Yilbber, hice un pago en línea y no pude ver la confirmación." />
            </div>
          </div>
        )}

        {estado.tipo === "listo" && (
          <Resultado pago={estado.pago} onActualizar={() => void consultar()} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Resultado({ pago, onActualizar }: { pago: PagoAplicado; onActualizar: () => void }) {
  const resumen = `el pedido ${pago.orderNumber} por ${formatoCOP(pago.totalCop)}`;

  if (PAGADO.includes(pago.status)) {
    return (
      <div>
        <CircleCheck className="mx-auto h-14 w-14 text-brand-orange" aria-hidden="true" />
        <h1 className="mt-4 text-2xl uppercase text-brand-navy md:text-3xl">¡Pago aprobado!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Recibimos tu pago y ya estamos alistando tu pedido. Te escribimos por WhatsApp para
          coordinar la entrega.
        </p>
        <TarjetaPedido pago={pago} etiqueta="Total pagado" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <BotonWhatsApp mensaje={`Hola Papelería Yilbber, acabo de pagar en línea ${resumen}.`} />
          <Link
            to="/pedidos"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (pago.status === "pendiente_pago") {
    return (
      <div>
        <Clock className="mx-auto h-14 w-14 text-brand-orange" aria-hidden="true" />
        <h1 className="mt-4 text-2xl uppercase text-brand-navy md:text-3xl">
          Tu pago está en proceso
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Algunos pagos, como PSE, tardan unos minutos en confirmarse. Tu pedido quedó guardado y lo
          empezamos a alistar apenas el banco apruebe el pago.
        </p>
        <TarjetaPedido pago={pago} etiqueta="Total del pedido" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <BotonSecundario onClick={onActualizar}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar estado
          </BotonSecundario>
          <BotonWhatsApp
            mensaje={`Hola Papelería Yilbber, mi pago en línea de ${resumen} quedó en proceso.`}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <CircleX className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
      <h1 className="mt-4 text-2xl uppercase text-brand-navy md:text-3xl">
        El pago no se completó
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {pago.respuesta ? `ePayco respondió: ${pago.respuesta}. ` : ""}
        Tu carrito sigue guardado para que lo intentes de nuevo, con otro medio de pago si
        prefieres.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/checkout"
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Intentar de nuevo
        </Link>
        <BotonWhatsApp mensaje={`Hola Papelería Yilbber, no pude pagar en línea ${resumen}.`} />
      </div>
    </div>
  );
}

function TarjetaPedido({ pago, etiqueta }: { pago: PagoAplicado; etiqueta: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-navy/70">
        Número de pedido
      </p>
      <p className="font-display text-3xl text-brand-navy">{pago.orderNumber}</p>
      <p className="mt-4 text-sm text-muted-foreground">{etiqueta}</p>
      <p className="font-display text-xl text-brand-orange">{formatoCOP(pago.totalCop)}</p>
      {pago.prueba && (
        <p className="mt-4 rounded-2xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">
          Pago de prueba (sandbox de ePayco): no se cobró dinero real.
        </p>
      )}
    </div>
  );
}

function BotonSecundario({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-secondary-foreground"
    >
      {children}
    </button>
  );
}

function BotonWhatsApp({ mensaje }: { mensaje: string }) {
  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      Escribirnos por WhatsApp
    </a>
  );
}

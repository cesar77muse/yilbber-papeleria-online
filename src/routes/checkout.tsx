import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Copy,
  ImageUp,
  Loader2,
  MessageCircle,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  NEQUI_NUMERO,
  NEQUI_NUMERO_VISIBLE,
  NEQUI_TITULAR,
  WHATSAPP,
} from "@/components/site/data";
import { formatoCOP, imagenDe } from "@/components/tienda/images";
import { useCartStore, totalCOP, totalUnidades, type CartItem } from "@/stores/cartStore";
import { crearPedido, type PedidoCreado } from "@/lib/pedidos.functions";
import {
  prepararComprobante,
  TIPOS_ACEPTADOS,
  type ComprobantePreparado,
} from "@/lib/comprobante";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido | Papelería Yilbber" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type Entrega = "recoger" | "domicilio";

type Datos = {
  nombre: string;
  telefono: string;
  correo: string;
  entrega: Entrega;
  direccion: string;
  notas: string;
};

const DATOS_INICIALES: Datos = {
  nombre: "",
  telefono: "",
  correo: "",
  entrega: "recoger",
  direccion: "",
  notas: "",
};

const PASOS = [
  { n: 1, label: "Tus datos" },
  { n: 2, label: "Pago Nequi" },
  { n: 3, label: "Comprobante" },
] as const;

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30";
const labelClass = "text-sm font-semibold text-brand-navy";

function CheckoutPage() {
  // El carrito vive en localStorage: esperamos a hidratar para no pintar en el
  // servidor un carrito vacío que después salta a tener productos.
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [datos, setDatos] = useState<Datos>(DATOS_INICIALES);
  const [errores, setErrores] = useState<Partial<Record<keyof Datos, string>>>({});
  const [comprobante, setComprobante] = useState<ComprobantePreparado | null>(null);
  const [leyendoArchivo, setLeyendoArchivo] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [pedido, setPedido] = useState<PedidoCreado | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const total = totalCOP(items);
  const unidades = totalUnidades(items);

  // La miniatura es un objectURL: hay que soltarla al cambiar de archivo.
  useEffect(() => {
    const url = comprobante?.previewUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [comprobante]);

  const actualizar = (campo: keyof Datos, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const validarDatos = () => {
    const nuevos: Partial<Record<keyof Datos, string>> = {};
    if (datos.nombre.trim().length < 2) nuevos.nombre = "Escribe tu nombre completo";
    if (datos.telefono.trim().replace(/\D/g, "").length < 7)
      nuevos.telefono = "Escribe un teléfono de contacto";
    if (datos.correo.trim() !== "" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo.trim()))
      nuevos.correo = "Ese correo no parece válido";
    if (datos.entrega === "domicilio" && datos.direccion.trim().length < 5)
      nuevos.direccion = "Escribe la dirección de entrega";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const elegirArchivo = async (file: File | undefined) => {
    if (!file) return;
    setErrorEnvio(null);
    setLeyendoArchivo(true);
    try {
      setComprobante(await prepararComprobante(file));
    } catch (e) {
      setComprobante(null);
      toast.error(e instanceof Error ? e.message : "No pudimos leer ese archivo");
    } finally {
      setLeyendoArchivo(false);
      if (inputArchivo.current) inputArchivo.current.value = "";
    }
  };

  const enviar = async () => {
    if (!comprobante || enviando) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const creado = await crearPedido({
        data: {
          cliente: {
            nombre: datos.nombre.trim(),
            telefono: datos.telefono.trim(),
            correo: datos.correo.trim(),
            entrega: datos.entrega,
            direccion: datos.direccion.trim(),
            notas: datos.notas.trim(),
          },
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          referencia: referencia.trim(),
          comprobante: { tipo: comprobante.tipo, base64: comprobante.base64 },
        },
      });
      setPedido(creado);
      clearCart();
    } catch (e) {
      setErrorEnvio(
        e instanceof Error && e.message
          ? e.message
          : "No pudimos registrar tu pedido. Intenta de nuevo o escríbenos por WhatsApp.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const copiarNequi = async () => {
    try {
      await navigator.clipboard.writeText(NEQUI_NUMERO);
      toast.success("Número Nequi copiado");
    } catch {
      toast.error(`Copia el número manualmente: ${NEQUI_NUMERO_VISIBLE}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        {pedido ? (
          <PedidoConfirmado pedido={pedido} datos={datos} />
        ) : !hidratado ? (
          <div className="py-24 text-center text-sm text-muted-foreground">Cargando tu carrito…</div>
        ) : items.length === 0 ? (
          <CarritoVacio />
        ) : (
          <>
            <Link
              to="/pedidos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Seguir comprando
            </Link>

            <h1 className="mt-5 text-2xl uppercase text-brand-navy md:text-4xl">Finalizar pedido</h1>
            <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />

            <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Pasos">
              {PASOS.map((p, i) => (
                <li key={p.n} className="flex items-center gap-3">
                  <span
                    aria-current={paso === p.n ? "step" : undefined}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                      paso === p.n
                        ? "bg-brand-navy text-secondary-foreground"
                        : paso > p.n
                          ? "bg-brand-orange/15 text-brand-orange"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/25">
                      {paso > p.n ? <Check className="h-3 w-3" aria-hidden="true" /> : p.n}
                    </span>
                    {p.label}
                  </span>
                  {i < PASOS.length - 1 && (
                    <span className="hidden h-px w-6 bg-brand-navy/20 sm:block" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
              <section className="rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm md:p-8">
                {paso === 1 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (validarDatos()) setPaso(2);
                    }}
                    noValidate
                  >
                    <h2 className="text-lg uppercase text-brand-navy">¿Para quién es el pedido?</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Con estos datos te contactamos para confirmar la entrega.
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="nombre" className={labelClass}>
                          Nombre completo
                        </label>
                        <input
                          id="nombre"
                          value={datos.nombre}
                          onChange={(e) => actualizar("nombre", e.target.value)}
                          placeholder="Tu nombre"
                          className={inputClass}
                          aria-invalid={!!errores.nombre}
                        />
                        {errores.nombre && <ErrorCampo>{errores.nombre}</ErrorCampo>}
                      </div>
                      <div>
                        <label htmlFor="telefono" className={labelClass}>
                          Teléfono / WhatsApp
                        </label>
                        <input
                          id="telefono"
                          inputMode="tel"
                          value={datos.telefono}
                          onChange={(e) => actualizar("telefono", e.target.value)}
                          placeholder="300 000 0000"
                          className={inputClass}
                          aria-invalid={!!errores.telefono}
                        />
                        {errores.telefono && <ErrorCampo>{errores.telefono}</ErrorCampo>}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="correo" className={labelClass}>
                        Correo <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        id="correo"
                        type="email"
                        value={datos.correo}
                        onChange={(e) => actualizar("correo", e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className={inputClass}
                        aria-invalid={!!errores.correo}
                      />
                      {errores.correo && <ErrorCampo>{errores.correo}</ErrorCampo>}
                    </div>

                    <fieldset className="mt-6">
                      <legend className={labelClass}>¿Cómo quieres recibirlo?</legend>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {(
                          [
                            {
                              id: "recoger",
                              titulo: "Recoger en la papelería",
                              detalle: "Cra. 15 No. 17-44, Duitama",
                            },
                            {
                              id: "domicilio",
                              titulo: "Domicilio en Duitama",
                              detalle: "Coordinamos el envío contigo",
                            },
                          ] as const
                        ).map((opcion) => (
                          <label
                            key={opcion.id}
                            className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                              datos.entrega === opcion.id
                                ? "border-brand-orange bg-brand-orange/5"
                                : "border-input hover:border-brand-navy/30"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="entrega"
                                value={opcion.id}
                                checked={datos.entrega === opcion.id}
                                onChange={() => actualizar("entrega", opcion.id)}
                                className="accent-brand-orange"
                              />
                              <span className="text-sm font-bold text-brand-navy">
                                {opcion.titulo}
                              </span>
                            </span>
                            <span className="mt-1 block pl-6 text-xs text-muted-foreground">
                              {opcion.detalle}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {datos.entrega === "domicilio" && (
                      <div className="mt-4">
                        <label htmlFor="direccion" className={labelClass}>
                          Dirección de entrega
                        </label>
                        <input
                          id="direccion"
                          value={datos.direccion}
                          onChange={(e) => actualizar("direccion", e.target.value)}
                          placeholder="Calle 00 # 00-00, barrio"
                          className={inputClass}
                          aria-invalid={!!errores.direccion}
                        />
                        {errores.direccion && <ErrorCampo>{errores.direccion}</ErrorCampo>}
                      </div>
                    )}

                    <div className="mt-4">
                      <label htmlFor="notas" className={labelClass}>
                        Notas para la papelería{" "}
                        <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <textarea
                        id="notas"
                        rows={3}
                        value={datos.notas}
                        onChange={(e) => actualizar("notas", e.target.value)}
                        placeholder="Color preferido, marca, hora para recoger…"
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.02] sm:w-auto"
                    >
                      Continuar al pago
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                )}

                {paso === 2 && (
                  <div>
                    <h2 className="text-lg uppercase text-brand-navy">Paga con Nequi</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Transfiere el total del pedido a nuestra cuenta Nequi y guarda el pantallazo
                      del comprobante.
                    </p>

                    <div className="mt-6 rounded-3xl border-2 border-dashed border-brand-orange/50 bg-brand-orange/5 p-6 text-center">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-navy/70">
                        Nequi a nombre de {NEQUI_TITULAR}
                      </p>
                      <p className="mt-2 font-display text-3xl text-brand-navy md:text-4xl">
                        {NEQUI_NUMERO_VISIBLE}
                      </p>
                      <button
                        type="button"
                        onClick={copiarNequi}
                        className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-4 py-2 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-secondary-foreground"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Copiar número
                      </button>
                      <p className="mt-5 text-sm text-muted-foreground">Valor a transferir</p>
                      <p className="font-display text-2xl text-brand-orange">{formatoCOP(total)}</p>
                    </div>

                    <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
                      {[
                        `Abre tu app Nequi y envía ${formatoCOP(total)} al número ${NEQUI_NUMERO_VISIBLE}.`,
                        "Toma un pantallazo del comprobante donde se vea el valor y la fecha.",
                        "Vuelve aquí y adjunta el pantallazo para confirmar tu pedido.",
                      ].map((texto, i) => (
                        <li key={texto} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-[11px] font-bold text-secondary-foreground">
                            {i + 1}
                          </span>
                          <span>{texto}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setPaso(1)}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-secondary-foreground"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Volver
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaso(3)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] sm:flex-none"
                      >
                        Ya transferí, adjuntar comprobante
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}

                {paso === 3 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      enviar();
                    }}
                  >
                    <h2 className="text-lg uppercase text-brand-navy">Adjunta tu comprobante</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Sube el pantallazo de la transferencia Nequi. Un asesor lo verifica y empezamos
                      a alistar tu pedido.
                    </p>

                    <input
                      ref={inputArchivo}
                      id="comprobante"
                      type="file"
                      accept={TIPOS_ACEPTADOS}
                      className="sr-only"
                      onChange={(e) => elegirArchivo(e.target.files?.[0])}
                    />

                    {comprobante ? (
                      <div className="mt-6 flex items-center gap-4 rounded-3xl border border-brand-navy/10 bg-background p-4">
                        {comprobante.previewUrl ? (
                          <img
                            src={comprobante.previewUrl}
                            alt="Vista previa del comprobante"
                            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-navy/5 text-xs font-bold text-brand-navy">
                            PDF
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-navy">
                            {comprobante.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(comprobante.bytes / 1024).toFixed(0)} KB listos para enviar
                          </p>
                          <button
                            type="button"
                            onClick={() => setComprobante(null)}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-destructive hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Cambiar archivo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="comprobante"
                        className="mt-6 flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed border-brand-navy/25 p-10 text-center transition-colors hover:border-brand-orange hover:bg-brand-orange/5"
                      >
                        {leyendoArchivo ? (
                          <Loader2
                            className="h-8 w-8 animate-spin text-brand-orange"
                            aria-hidden="true"
                          />
                        ) : (
                          <ImageUp className="h-8 w-8 text-brand-orange" aria-hidden="true" />
                        )}
                        <span className="mt-3 text-sm font-bold text-brand-navy">
                          {leyendoArchivo ? "Preparando la imagen…" : "Seleccionar pantallazo"}
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          JPG, PNG, WEBP o PDF
                        </span>
                      </label>
                    )}

                    <div className="mt-4">
                      <label htmlFor="referencia" className={labelClass}>
                        Número de referencia Nequi{" "}
                        <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        id="referencia"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        placeholder="M1234567"
                        className={inputClass}
                      />
                    </div>

                    {errorEnvio && (
                      <p
                        role="alert"
                        className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                      >
                        {errorEnvio}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setPaso(2)}
                        disabled={enviando}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-secondary-foreground disabled:opacity-50"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={!comprobante || enviando || leyendoArchivo}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        {enviando ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                        {enviando ? "Enviando pedido…" : "Confirmar pedido"}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <Resumen items={items} total={total} unidades={unidades} onQuitar={removeItem} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ErrorCampo({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
      {children}
    </p>
  );
}

function Resumen({
  items,
  total,
  unidades,
  onQuitar,
}: {
  items: CartItem[];
  total: number;
  unidades: number;
  onQuitar: (id: string) => void;
}) {
  return (
    <aside className="h-fit rounded-3xl border border-brand-navy/10 bg-card p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-sm uppercase text-brand-navy">
        Tu pedido · {unidades} {unidades === 1 ? "producto" : "productos"}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <img
              src={imagenDe(item.imageUrl)}
              alt=""
              className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-brand-navy">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatoCOP(item.priceCop)}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-brand-navy">
                {formatoCOP(item.priceCop * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => onQuitar(item.id)}
                aria-label={`Quitar ${item.name} del pedido`}
                className="mt-1 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-brand-navy/10 pt-4">
        <span className="text-sm font-semibold text-brand-navy">Total</span>
        <span className="font-display text-xl text-brand-orange">{formatoCOP(total)}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        El domicilio, si aplica, se acuerda por WhatsApp y no está incluido en este total.
      </p>
    </aside>
  );
}

function CarritoVacio() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-brand-orange/50 p-12 text-center">
      <ShoppingCart className="mx-auto h-10 w-10 text-brand-orange/60" aria-hidden="true" />
      <h1 className="mt-4 text-xl uppercase text-brand-navy">Tu carrito está vacío</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Agrega productos del catálogo para poder finalizar un pedido.
      </p>
      <Link
        to="/pedidos"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground"
      >
        Ver catálogo
      </Link>
    </div>
  );
}

function PedidoConfirmado({ pedido, datos }: { pedido: PedidoCreado; datos: Datos }) {
  const mensaje = encodeURIComponent(
    `Hola Papelería Yilbber, acabo de hacer el pedido ${pedido.orderNumber} por ${formatoCOP(
      pedido.totalCop,
    )} y ya adjunté el comprobante de Nequi.`,
  );

  return (
    <div className="mx-auto max-w-xl text-center">
      <CircleCheck className="mx-auto h-14 w-14 text-brand-orange" aria-hidden="true" />
      <h1 className="mt-4 text-2xl uppercase text-brand-navy md:text-3xl">¡Pedido recibido!</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Gracias {datos.nombre.split(" ")[0]}. Ya recibimos tu comprobante y estamos verificando la
        transferencia. Te confirmamos por WhatsApp al {datos.telefono} apenas quede listo.
      </p>

      <div className="mt-6 rounded-3xl border border-brand-navy/10 bg-card p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-navy/70">
          Número de pedido
        </p>
        <p className="font-display text-3xl text-brand-navy">{pedido.orderNumber}</p>
        <p className="mt-4 text-sm text-muted-foreground">Total pagado</p>
        <p className="font-display text-xl text-brand-orange">{formatoCOP(pedido.totalCop)}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          {datos.entrega === "domicilio"
            ? `Lo enviamos a: ${datos.direccion}`
            : "Puedes recogerlo en Cra. 15 No. 17-44, Duitama."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/${WHATSAPP}?text=${mensaje}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Escribirnos por WhatsApp
        </a>
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

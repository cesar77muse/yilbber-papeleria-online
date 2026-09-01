import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Cierre del carrito con pago por transferencia Nequi.
 *
 * El navegador manda qué productos quiere y el screenshot del comprobante;
 * el servidor vuelve a leer los precios de `products` y arma el total. Nunca se
 * confía en el precio que llega del cliente.
 */

export const BUCKET_COMPROBANTES = "comprobantes";

/** ~8 MB de imagen ya codificada en base64 (el bucket corta en 8 MB reales). */
const MAX_BASE64 = 11_000_000;

const TIPOS_COMPROBANTE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

const comprobanteSchema = z.object({
  tipo: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  base64: z.string().min(64, "El comprobante llegó vacío").max(MAX_BASE64, "El archivo es muy pesado"),
});

const pedidoSchema = z
  .object({
    cliente: z.object({
      nombre: z.string().trim().min(2, "Escribe tu nombre").max(120),
      telefono: z
        .string()
        .trim()
        .min(7, "Escribe un teléfono válido")
        .max(20)
        .regex(/^[0-9+()\s-]+$/, "El teléfono sólo puede tener números"),
      correo: z.union([z.string().trim().email("Correo inválido").max(320), z.literal("")]).default(""),
      entrega: z.enum(["recoger", "domicilio"]),
      direccion: z.string().trim().max(300).default(""),
      notas: z.string().trim().max(1000).default(""),
    }),
    items: z
      .array(
        z.object({
          id: z.string().uuid(),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1, "Tu carrito está vacío")
      .max(100, "Demasiados productos para un solo pedido"),
    referencia: z.string().trim().max(60).default(""),
    comprobante: comprobanteSchema,
  })
  .refine((p) => p.cliente.entrega !== "domicilio" || p.cliente.direccion.length >= 5, {
    message: "Escribe la dirección de entrega",
    path: ["cliente", "direccion"],
  });

export type NuevoPedido = z.input<typeof pedidoSchema>;

export type PedidoCreado = {
  orderNumber: string;
  totalCop: number;
};

/** base64 -> bytes sin depender de Buffer (el build de producción corre en Workers). */
function decodificarBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binario = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

export const crearPedido = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pedidoSchema.parse(data))
  .handler(async ({ data }): Promise<PedidoCreado> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Precios reales, desde la base, sólo de productos activos.
    const ids = [...new Set(data.items.map((i) => i.id))];
    const { data: productos, error: errorProductos } = await supabaseAdmin
      .from("products")
      .select("id, name, sku, slug, price_cop")
      .eq("is_active", true)
      .in("id", ids);

    if (errorProductos) throw errorProductos;

    const porId = new Map((productos ?? []).map((p) => [p.id, p]));
    const faltantes = ids.filter((id) => !porId.has(id));
    if (faltantes.length > 0) {
      throw new Error(
        "Algunos productos de tu carrito ya no están disponibles. Vuelve al carrito y quítalos para continuar.",
      );
    }

    const lineas = data.items.map((item) => {
      const producto = porId.get(item.id)!;
      return {
        product_id: producto.id,
        name: producto.name,
        sku: producto.sku,
        slug: producto.slug,
        unit_price_cop: producto.price_cop,
        quantity: item.quantity,
        line_total_cop: producto.price_cop * item.quantity,
      };
    });

    const total = lineas.reduce((suma, l) => suma + l.line_total_cop, 0);

    // 2. El comprobante va a un bucket privado; en la tabla sólo queda la ruta.
    const bytes = decodificarBase64(data.comprobante.base64);
    const extension = TIPOS_COMPROBANTE[data.comprobante.tipo];
    const ruta = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

    const { error: errorUpload } = await supabaseAdmin.storage
      .from(BUCKET_COMPROBANTES)
      .upload(ruta, new Blob([bytes], { type: data.comprobante.tipo }), {
        contentType: data.comprobante.tipo,
        upsert: false,
      });

    if (errorUpload) throw new Error(`No pudimos guardar el comprobante: ${errorUpload.message}`);

    // 3. Pedido + líneas. Si algo falla, no dejamos el archivo huérfano.
    const { data: pedido, error: errorPedido } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.cliente.nombre,
        customer_phone: data.cliente.telefono,
        customer_email: data.cliente.correo || null,
        delivery_method: data.cliente.entrega,
        delivery_address: data.cliente.entrega === "domicilio" ? data.cliente.direccion : null,
        notes: data.cliente.notas || null,
        subtotal_cop: total,
        total_cop: total,
        payment_method: "nequi",
        payment_reference: data.referencia || null,
        payment_proof_path: ruta,
        status: "pendiente_verificacion",
      })
      .select("id, order_number")
      .single();

    if (errorPedido || !pedido) {
      await supabaseAdmin.storage.from(BUCKET_COMPROBANTES).remove([ruta]);
      throw errorPedido ?? new Error("No pudimos registrar el pedido");
    }

    const { error: errorItems } = await supabaseAdmin
      .from("order_items")
      .insert(lineas.map((l) => ({ ...l, order_id: pedido.id })));

    if (errorItems) {
      await supabaseAdmin.from("orders").delete().eq("id", pedido.id);
      await supabaseAdmin.storage.from(BUCKET_COMPROBANTES).remove([ruta]);
      throw errorItems;
    }

    return { orderNumber: pedido.order_number, totalCop: total };
  });

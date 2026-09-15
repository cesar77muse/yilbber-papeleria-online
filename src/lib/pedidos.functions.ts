import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { clienteSchema, conDireccionSiDomicilio, itemsSchema } from "@/lib/pedidos.schema";

/**
 * Cierre del carrito con pago por transferencia Nequi.
 *
 * El navegador manda qué productos quiere y el screenshot del comprobante;
 * el servidor vuelve a leer los precios de `products` y arma el total. Nunca se
 * confía en el precio que llega del cliente. El pago con ePayco está en
 * pagos.functions.ts y comparte el armado del pedido (pedidos.server.ts).
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
  base64: z
    .string()
    .min(64, "El comprobante llegó vacío")
    .max(MAX_BASE64, "El archivo es muy pesado"),
});

const pedidoSchema = z
  .object({
    cliente: clienteSchema,
    items: itemsSchema,
    referencia: z.string().trim().max(60).default(""),
    comprobante: comprobanteSchema,
  })
  .refine(...conDireccionSiDomicilio);

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
    const { armarLineas, datosCliente, guardarPedido } = await import("@/lib/pedidos.server");

    // 1. Precios reales y mínimo de domicilio, desde la base.
    const { lineas, total } = await armarLineas(data.items, data.cliente.entrega);

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
    try {
      const pedido = await guardarPedido(
        {
          ...datosCliente(data.cliente),
          subtotal_cop: total,
          total_cop: total,
          payment_method: "nequi",
          payment_reference: data.referencia || null,
          payment_proof_path: ruta,
          status: "pendiente_verificacion",
        },
        lineas,
      );
      return { orderNumber: pedido.order_number, totalCop: total };
    } catch (e) {
      await supabaseAdmin.storage.from(BUCKET_COMPROBANTES).remove([ruta]);
      throw e;
    }
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EPAYCO_MAXIMO_COP, EPAYCO_MINIMO_COP } from "@/components/site/data";
import { clienteSchema, conDireccionSiDomicilio, itemsSchema } from "@/lib/pedidos.schema";
import { SITE_URL } from "@/lib/site-url";
import type { PagoAplicado } from "@/lib/epayco.server";

/**
 * Pago en línea con ePayco (tarjeta crédito/débito y PSE).
 *
 * `iniciarPagoEpayco` guarda el pedido en 'pendiente_pago' y crea la sesión de
 * checkout; el navegador la abre con el sessionId. `verificarPagoEpayco` lo usa
 * /pago/respuesta para consultar el resultado directo a ePayco. El webhook de
 * confirmación vive en src/routes/api/epayco/confirmacion.ts.
 */

const inicioSchema = z
  .object({ cliente: clienteSchema, items: itemsSchema })
  .refine(...conDireccionSiDomicilio);

export type SesionEpayco = {
  sessionId: string;
  orderNumber: string;
  totalCop: number;
};

export const iniciarPagoEpayco = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inicioSchema.parse(data))
  .handler(async ({ data }): Promise<SesionEpayco> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { armarLineas, datosCliente, formatoCOP, guardarPedido } =
      await import("@/lib/pedidos.server");
    const { crearSesionEpayco, modoPrueba } = await import("@/lib/epayco.server");

    const { lineas, total } = await armarLineas(data.items, data.cliente.entrega);

    if (total < EPAYCO_MINIMO_COP || total > EPAYCO_MAXIMO_COP) {
      throw new Error(
        `El pago en línea es para pedidos entre ${formatoCOP(EPAYCO_MINIMO_COP)} y ${formatoCOP(EPAYCO_MAXIMO_COP)}. Tu pedido suma ${formatoCOP(total)}: puedes pagarlo por Nequi.`,
      );
    }

    const pedido = await guardarPedido(
      {
        ...datosCliente(data.cliente),
        subtotal_cop: total,
        total_cop: total,
        payment_method: "epayco",
        payment_proof_path: null,
        payment_test: modoPrueba(),
        status: "pendiente_pago",
      },
      lineas,
    );

    // Las URLs salen del origen que atendió la petición. ePayco rechaza las de
    // localhost, así que en desarrollo apuntan al dominio público; para
    // verificar en local, abrir /pago/respuesta?ref_payco=... en localhost.
    const request = getRequest();
    const origenPeticion = new URL(request.url);
    const esLocal = /^(localhost|127\.|10\.|192\.168\.|\[::1\])/.test(origenPeticion.hostname);
    const origen = esLocal ? SITE_URL : origenPeticion.origin;
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    try {
      const sessionId = await crearSesionEpayco({
        pedidoId: pedido.id,
        orderNumber: pedido.order_number,
        totalCop: total,
        ip,
        urlRespuesta: `${origen}/pago/respuesta`,
        urlConfirmacion: `${origen}/api/epayco/confirmacion`,
        cliente: {
          nombre: data.cliente.nombre,
          correo: data.cliente.correo,
          telefono: data.cliente.telefono,
        },
      });
      return { sessionId, orderNumber: pedido.order_number, totalCop: total };
    } catch (e) {
      // Sin sesión ese pedido no se puede pagar: no lo dejamos colgado.
      await supabaseAdmin.from("orders").delete().eq("id", pedido.id);
      throw e;
    }
  });

const verificacionSchema = z.object({
  ref: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{1,40}$/, "La referencia de pago no es válida"),
});

export const verificarPagoEpayco = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verificacionSchema.parse(data))
  .handler(async ({ data }): Promise<PagoAplicado> => {
    const { aplicarResultado, consultarTransaccion } = await import("@/lib/epayco.server");

    const resultado = await consultarTransaccion(data.ref);
    if (!resultado) throw new Error("No encontramos esa transacción en ePayco.");

    const pago = await aplicarResultado(resultado);
    if (!pago) {
      throw new Error("No encontramos el pedido de esta transacción. Escríbenos por WhatsApp.");
    }
    return pago;
  });

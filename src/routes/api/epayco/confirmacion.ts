import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Webhook de confirmación de ePayco (la URL `confirmation` de cada sesión).
 *
 * ePayco lo llama servidor a servidor, por GET o POST (form o JSON), y lo
 * reintenta si no respondemos 200. Antes de tocar un pedido se valida la firma
 * con P_CUST_ID_CLIENTE y P_KEY; el monto y el modo prueba/producción se
 * validan en `aplicarResultado`.
 */

const REQUERIDOS = [
  "x_ref_payco",
  "x_transaction_id",
  "x_amount",
  "x_currency_code",
  "x_signature",
  "x_id_invoice",
];

const texto = (cuerpo: string, status: number) =>
  new Response(cuerpo, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

async function leerCampos(request: Request): Promise<Record<string, string>> {
  const campos: Record<string, string> = Object.fromEntries(new URL(request.url).searchParams);
  if (request.method !== "POST") return campos;

  const tipo = request.headers.get("content-type") ?? "";
  if (tipo.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    for (const [clave, valor] of Object.entries(json)) {
      if (valor !== null && typeof valor !== "object") campos[clave] = String(valor);
    }
  } else {
    const form = await request.formData();
    form.forEach((valor, clave) => {
      if (typeof valor === "string") campos[clave] = valor;
    });
  }
  return campos;
}

async function confirmar(request: Request): Promise<Response> {
  const { aplicarResultado, aResultado, firmaValida } = await import("@/lib/epayco.server");

  let campos: Record<string, string>;
  try {
    campos = await leerCampos(request);
  } catch {
    return texto("Solicitud inválida", 400);
  }

  if (REQUERIDOS.some((campo) => !campos[campo])) return texto("Faltan campos", 400);

  if (!(await firmaValida(campos))) {
    console.warn(`[ePayco] Firma inválida en la confirmación de ${campos["x_ref_payco"]}`);
    return texto("Firma inválida", 400);
  }

  try {
    await aplicarResultado(aResultado(campos));
  } catch (e) {
    // 500 para que ePayco reintente más tarde.
    console.error("[ePayco] No se pudo aplicar la confirmación", e);
    return texto("Error", 500);
  }

  return texto("OK", 200);
}

export const Route = createFileRoute("/api/epayco/confirmacion")({
  server: {
    handlers: {
      GET: ({ request }) => confirmar(request),
      POST: ({ request }) => confirmar(request),
    },
  },
});

import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Pasarela ePayco (checkout por sesión, versión 2). Sólo servidor: lee las
 * llaves privadas de EPAYCO_* en el entorno (.env.local en desarrollo).
 *
 * Flujo: login con PUBLIC_KEY:PRIVATE_KEY -> token -> crear sesión -> el
 * navegador abre el checkout con el sessionId. El resultado llega por dos lados
 * y los dos terminan en `aplicarResultado`:
 *   - el webhook de confirmación, firmado con P_CUST_ID_CLIENTE y P_KEY;
 *   - la consulta directa a ePayco desde la página de respuesta, que además
 *     cubre el desarrollo local (ePayco no alcanza un webhook en localhost).
 *
 * Se habla con la API por fetch y la firma se calcula con Web Crypto porque el
 * build de producción corre en Cloudflare Workers, donde el SDK de Node no sirve.
 */

const API_URL = "https://apify.epayco.co";

type Config = {
  custId: string;
  pKey: string;
  publicKey: string;
  privateKey: string;
  test: boolean;
};

function leerConfig(): Config {
  const leer = (nombre: string) => process.env[nombre]?.trim() ?? "";
  const llaves = {
    EPAYCO_CUST_ID: leer("EPAYCO_CUST_ID"),
    EPAYCO_P_KEY: leer("EPAYCO_P_KEY"),
    EPAYCO_PUBLIC_KEY: leer("EPAYCO_PUBLIC_KEY"),
    EPAYCO_PRIVATE_KEY: leer("EPAYCO_PRIVATE_KEY"),
  };
  const faltantes = Object.entries(llaves)
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre);
  if (faltantes.length > 0) {
    console.error(`[ePayco] Faltan variables de entorno: ${faltantes.join(", ")}`);
    throw new Error(
      "El pago en línea no está disponible en este momento. Intenta pagar por Nequi.",
    );
  }

  // El modo se exige explícito: sin EPAYCO_TEST=true|false no se cobra nada, para
  // que una prueba nunca termine en cobro real ni producción quede en pruebas.
  const modo = leer("EPAYCO_TEST").toLowerCase();
  if (modo !== "true" && modo !== "false") {
    console.error('[ePayco] EPAYCO_TEST debe ser "true" (pruebas) o "false" (producción)');
    throw new Error(
      "El pago en línea no está disponible en este momento. Intenta pagar por Nequi.",
    );
  }

  return {
    custId: llaves.EPAYCO_CUST_ID,
    pKey: llaves.EPAYCO_P_KEY,
    publicKey: llaves.EPAYCO_PUBLIC_KEY,
    privateKey: llaves.EPAYCO_PRIVATE_KEY,
    test: modo === "true",
  };
}

export const modoPrueba = () => leerConfig().test;

/** Para el checkout: si el pago en línea está configurado y en qué modo. Nunca lanza. */
export function estadoEpayco(): { disponible: boolean; prueba: boolean } {
  try {
    return { disponible: true, prueba: leerConfig().test };
  } catch {
    return { disponible: false, prueba: false };
  }
}

async function login(config: Config): Promise<string> {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${config.publicKey}:${config.privateKey}`)}`,
    },
    body: "{}",
  });
  const json = (await res.json().catch(() => ({}))) as { token?: string };
  if (!res.ok || !json.token) {
    console.error(`[ePayco] El login falló (HTTP ${res.status})`);
    throw new Error(
      "No pudimos conectar con la pasarela de pagos. Intenta de nuevo en un momento.",
    );
  }
  return json.token;
}

export type NuevaSesion = {
  pedidoId: string;
  orderNumber: string;
  totalCop: number;
  ip: string;
  urlRespuesta: string;
  urlConfirmacion: string;
  cliente: { nombre: string; correo: string; telefono: string };
};

export async function crearSesionEpayco(sesion: NuevaSesion): Promise<string> {
  const config = leerConfig();
  const token = await login(config);

  // ePayco valida todos estos campos como texto, incluidos `test` y `amount`.
  // Sin `billing`: el checkout le pide al cliente su documento; sólo
  // precargamos lo que ya nos dio.
  const body: Record<string, string> = {
    test: String(config.test),
    checkout_version: "2",
    name: "Papelería Yilbber",
    description: `Pedido ${sesion.orderNumber}`,
    invoice: sesion.orderNumber,
    currency: "COP",
    amount: String(sesion.totalCop),
    country: "CO",
    lang: "ES",
    ip: sesion.ip,
    response: sesion.urlRespuesta,
    confirmation: sesion.urlConfirmacion,
    extra1: sesion.pedidoId,
    nameBilling: sesion.cliente.nombre,
    mobilephoneBilling: sesion.cliente.telefono.replace(/\D/g, ""),
  };
  if (sesion.cliente.correo) body["emailBilling"] = sesion.cliente.correo;

  const res = await fetch(`${API_URL}/payment/session/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    textResponse?: string;
    data?: { sessionId?: string; errors?: { errorMessage?: string }[] };
  };
  if (!res.ok || !json.success || !json.data?.sessionId) {
    console.error(
      `[ePayco] No se creó la sesión (HTTP ${res.status}): ${json.textResponse ?? ""}`,
      json.data?.errors?.map((e) => e.errorMessage),
    );
    throw new Error("No pudimos abrir el pago en línea. Intenta de nuevo o paga por Nequi.");
  }
  return json.data.sessionId;
}

// --- Resultado de la transacción -------------------------------------------

export type ResultadoEpayco = {
  invoice: string;
  refPayco: string;
  transactionId: string;
  monto: number;
  moneda: string;
  codigo: number;
  respuesta: string;
  prueba: boolean;
};

/** Normaliza lo que manda el webhook (texto) o la consulta (números y texto). */
export function aResultado(d: Record<string, unknown>): ResultadoEpayco {
  const texto = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());
  return {
    invoice: texto(d["x_id_invoice"]),
    refPayco: texto(d["x_ref_payco"]),
    transactionId: texto(d["x_transaction_id"]),
    monto: Number(texto(d["x_amount"])),
    moneda: texto(d["x_currency_code"]).toUpperCase(),
    codigo: Number(texto(d["x_cod_response"] || d["x_cod_transaction_state"])),
    respuesta: texto(d["x_response"] || d["x_transaction_state"]),
    prueba: texto(d["x_test_request"]).toUpperCase() === "TRUE",
  };
}

async function sha256Hex(texto: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function igualesSinFiltrarTiempo(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

/** x_signature = sha256(p_cust_id_cliente^p_key^x_ref_payco^x_transaction_id^x_amount^x_currency_code) */
export async function firmaValida(campos: Record<string, string>): Promise<boolean> {
  const config = leerConfig();
  const esperada = await sha256Hex(
    [
      config.custId,
      config.pKey,
      campos["x_ref_payco"],
      campos["x_transaction_id"],
      campos["x_amount"],
      campos["x_currency_code"],
    ].join("^"),
  );
  return igualesSinFiltrarTiempo(esperada, (campos["x_signature"] ?? "").toLowerCase());
}

/**
 * Consulta la transacción directo a ePayco (servidor a servidor, autenticado).
 * El endpoint público /validation/v1/reference no reconoce las transacciones del
 * checkout v2 ("Error de datos o conexión"); /transaction/detail sí, y su `log`
 * trae los mismos campos x_* que manda el webhook.
 */
export async function consultarTransaccion(refPayco: string): Promise<ResultadoEpayco | null> {
  const config = leerConfig();
  const token = await login(config);
  const res = await fetch(`${API_URL}/transaction/detail`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ filter: { referencePayco: refPayco } }),
  });
  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: { log?: Record<string, unknown> | string };
  } | null;

  let log = json?.data?.log;
  if (typeof log === "string") {
    try {
      log = JSON.parse(log) as Record<string, unknown>;
    } catch {
      log = undefined;
    }
  }
  if (!res.ok || !json?.success || !log || typeof log !== "object") return null;
  // Una referencia de otro comercio no puede mover nuestros pedidos.
  if (String(log["x_cust_id_cliente"] ?? "") !== config.custId) return null;
  return aResultado(log);
}

// --- Pedido -------------------------------------------------------------

/** Estados en los que el pago todavía puede cambiar; los demás ya los maneja la papelería. */
const ESTADOS_ABIERTOS = ["pendiente_pago", "pago_rechazado"];

function estadoPorCodigo(codigo: number) {
  if (codigo === 1) return "pago_confirmado";
  // 3 pendiente (p. ej. PSE en proceso), 7 retenida, 8 iniciada: aún puede resolverse.
  if (codigo === 3 || codigo === 7 || codigo === 8) return "pendiente_pago";
  // 2 rechazada, 4 fallida, 6 reversada, 9 expirada, 10 abandonada, 11 cancelada...
  return "pago_rechazado";
}

export type PagoAplicado = {
  orderNumber: string;
  totalCop: number;
  status: string;
  respuesta: string;
  /** Transacción del sandbox de ePayco: no movió dinero real. */
  prueba: boolean;
};

/**
 * Lleva el resultado de ePayco al pedido. Idempotente: ePayco reintenta el
 * webhook y la página de respuesta puede consultar varias veces.
 */
export async function aplicarResultado(r: ResultadoEpayco): Promise<PagoAplicado | null> {
  const config = leerConfig();

  const { data: pedido, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, total_cop, status")
    .eq("order_number", r.invoice)
    .eq("payment_method", "epayco")
    .maybeSingle();

  if (error) throw error;
  if (!pedido) {
    console.warn(`[ePayco] Transacción ${r.refPayco} sin pedido (factura ${r.invoice})`);
    return null;
  }

  const sinCambios = {
    orderNumber: pedido.order_number,
    totalCop: pedido.total_cop,
    status: pedido.status,
    respuesta: r.respuesta,
    prueba: r.prueba,
  };

  if (r.moneda !== "COP" || r.monto !== pedido.total_cop) {
    console.error(
      `[ePayco] El monto de ${r.refPayco} (${r.monto} ${r.moneda}) no coincide con el pedido ${pedido.order_number} (${pedido.total_cop} COP)`,
    );
    return sinCambios;
  }

  // Una transacción de prueba nunca confirma un pedido real, ni al revés.
  if (r.prueba !== config.test) {
    console.error(
      `[ePayco] ${r.refPayco} es ${r.prueba ? "de prueba" : "real"} pero el sitio está en modo ${config.test ? "prueba" : "producción"}`,
    );
    return sinCambios;
  }

  if (!ESTADOS_ABIERTOS.includes(pedido.status)) return sinCambios;

  const status = estadoPorCodigo(r.codigo);
  const ahora = new Date().toISOString();
  const { error: errorUpdate } = await supabaseAdmin
    .from("orders")
    .update({
      status,
      payment_reference: r.refPayco,
      payment_transaction_id: r.transactionId || null,
      payment_response: r.respuesta || null,
      payment_test: r.prueba,
      paid_at: status === "pago_confirmado" ? ahora : null,
      updated_at: ahora,
    })
    .eq("id", pedido.id)
    .in("status", ESTADOS_ABIERTOS);

  if (errorUpdate) throw errorUpdate;

  return { ...sinCambios, status };
}

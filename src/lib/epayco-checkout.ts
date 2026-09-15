/**
 * Checkout de ePayco en el navegador: carga el script una sola vez y abre la
 * sesión que creó el servidor con `iniciarPagoEpayco`.
 */

const SCRIPT_URL = "https://checkout.epayco.co/checkout.js";

type ManejadorEpayco = { openNew: () => void };

declare global {
  interface Window {
    ePayco?: {
      checkout: {
        configure: (opciones: { sessionId: string; external: boolean }) => ManejadorEpayco;
      };
    };
  }
}

let cargando: Promise<void> | null = null;

function cargarScript(): Promise<void> {
  if (window.ePayco?.checkout) return Promise.resolve();

  cargando ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.ePayco?.checkout
        ? resolve()
        : reject(new Error("El checkout de ePayco no cargó bien. Intenta de nuevo."));
    script.onerror = () => {
      script.remove();
      reject(new Error("No pudimos cargar el checkout de ePayco. Revisa tu conexión."));
    };
    document.head.appendChild(script);
  }).catch((e: unknown) => {
    // Permite reintentar si falló la red.
    cargando = null;
    throw e;
  });

  return cargando;
}

export async function abrirCheckoutEpayco(sessionId: string): Promise<void> {
  await cargarScript();
  // external: false abre el checkout encima de la tienda. Al terminar, ePayco
  // lleva al cliente a /pago/respuesta?ref_payco=...
  window.ePayco!.checkout.configure({ sessionId, external: false }).openNew();
}

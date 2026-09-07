// Dominio público del sitio, en un solo lugar.
//
// Mientras el sitio viva en el subdominio de Lovable el valor por defecto sirve
// tal cual; cuando pase a un dominio propio basta con definir SITE_URL (o
// VITE_SITE_URL) en el entorno de despliegue, sin tocar código.
const FALLBACK_SITE_URL = "https://yilbber-papeleria-online.lovable.app";

function readSiteUrl(): string {
  // import.meta.env para el bundle del navegador (Vite lo reemplaza en build);
  // process.env para el render en servidor, igual que en el cliente de Supabase.
  const fromEnv =
    import.meta.env["VITE_SITE_URL"] ||
    (typeof process !== "undefined" ? process.env["SITE_URL"] : undefined);

  return fromEnv || FALLBACK_SITE_URL;
}

// Sin barra final para poder concatenar rutas directamente: `${SITE_URL}/pedidos`.
export const SITE_URL = readSiteUrl().replace(/\/+$/, "");

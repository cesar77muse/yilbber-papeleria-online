import { SITE_URL } from "@/lib/site-url";
import { EMAIL, GOOGLE_RESENAS, horario, sedes } from "@/components/site/data";
import { categorias } from "@/components/tienda/images";
import type { Producto } from "@/lib/productos.functions";

export const NOMBRE_NEGOCIO = "Papelería Yilbber";

// Imagen 1200×630 para WhatsApp, Facebook y Google cuando la página no tiene
// una propia. Vive en public/ para que su URL no cambie entre builds.
export const OG_IMAGE = `${SITE_URL}/og-yilbber.jpg`;

/** URL absoluta del sitio para canonical, og:url y datos estructurados. */
export const urlAbsoluta = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Canonical + og:url de una página, que siempre deben coincidir. */
export const canonical = (path: string) => ({
  meta: [{ property: "og:url", content: urlAbsoluta(path) }],
  links: [{ rel: "canonical", href: urlAbsoluta(path) }],
});

/**
 * `<script type="application/ld+json">` para el `scripts` del head. Se escapa
 * `<` para que un nombre de producto con "</script>" no cierre la etiqueta.
 */
export const jsonLd = (data: object) => ({
  type: "application/ld+json",
  children: JSON.stringify(data).replace(/</g, "\\u003c"),
});

// Los slugs y nombres vienen de la base: un & o < en un nombre rompería el XML.
export const escapeXml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos" }[c]};`,
  );

const ORGANIZACION_ID = `${SITE_URL}/#organizacion`;

// Datos de las dos sedes para Google (schema.org). Deben coincidir con el
// perfil de Google Business: mismo nombre, dirección y teléfono.
export function datosNegocio(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#sitio`,
        name: NOMBRE_NEGOCIO,
        url: `${SITE_URL}/`,
        inLanguage: "es-CO",
        publisher: { "@id": ORGANIZACION_ID },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZACION_ID,
        name: NOMBRE_NEGOCIO,
        alternateName: "Publigráficas Yilbber",
        url: `${SITE_URL}/`,
        logo: urlAbsoluta("/favicon.png"),
        image: OG_IMAGE,
        email: EMAIL,
        description,
        sameAs: [GOOGLE_RESENAS.url],
      },
      ...sedes.map((sede, i) => ({
        "@type": "Store",
        "@id": `${SITE_URL}/#sede-${i + 1}`,
        name: `${NOMBRE_NEGOCIO} – ${sede.nombre}`,
        parentOrganization: { "@id": ORGANIZACION_ID },
        url: `${SITE_URL}/`,
        image: OG_IMAGE,
        telephone: sede.telefonos[0]?.tel,
        email: EMAIL,
        priceRange: "$",
        currenciesAccepted: "COP",
        hasMap: sede.maps,
        openingHoursSpecification: horario.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.dayOfWeek.map((d) => `https://schema.org/${d}`),
          opens: h.opens,
          closes: h.closes,
        })),
        areaServed: { "@type": "City", name: "Duitama" },
        address: {
          "@type": "PostalAddress",
          streetAddress: sede.direccion,
          addressLocality: "Duitama",
          addressRegion: "Boyacá",
          addressCountry: "CO",
        },
      })),
    ],
  };
}

/**
 * Datos schema.org Product de una ficha: Google los usa para mostrar precio
 * y disponibilidad en los resultados y en las fichas gratuitas de Shopping.
 */
export function datosProducto(producto: Producto, path: string) {
  const url = urlAbsoluta(path);
  const categoria = categorias.find((c) => c.id === producto.category)?.label;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.name,
    url,
    image: [producto.image_url ?? OG_IMAGE],
    description: producto.description || `${producto.name} en ${NOMBRE_NEGOCIO}, Duitama.`,
    ...(producto.sku ? { sku: producto.sku } : {}),
    ...(producto.brand ? { brand: { "@type": "Brand", name: producto.brand } } : {}),
    ...(categoria ? { category: categoria } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "COP",
      price: producto.price_cop,
      // El catálogo sólo trae productos activos y no lleva inventario.
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", "@id": ORGANIZACION_ID, name: NOMBRE_NEGOCIO },
    },
  };
}

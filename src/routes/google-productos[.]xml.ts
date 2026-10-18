import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site-url";
import { listProductos, type Producto } from "@/lib/productos.functions";
import { categorias } from "@/components/tienda/images";
import { NOMBRE_NEGOCIO, escapeXml } from "@/lib/seo";

// Feed de productos para Google Merchant Center (RSS 2.0 con atributos g:).
// Merchant Center lo descarga una vez al día desde esta URL, así que un
// producto nuevo o un cambio de precio en la base llega solo a Google.
// Especificación: https://support.google.com/merchants/answer/7052112

const PALABRAS_MENORES = new Set("a al con de del el en la las los o para por sin x y".split(" "));

/**
 * Los nombres vienen del POS en MAYÚSCULAS, y Google rechaza o castiga los
 * títulos en mayúscula sostenida. "BLOCK IRIS CARTA" → "Block Iris Carta".
 * Las palabras con números (A4, X12, 1MT, 48*40) se dejan como están.
 */
function tituloLegible(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .map((palabra, i) => {
      if (/\d/.test(palabra)) return palabra;
      const minuscula = palabra.toLocaleLowerCase("es-CO");
      if (i > 0 && PALABRAS_MENORES.has(minuscula)) return minuscula;
      return minuscula.charAt(0).toLocaleUpperCase("es-CO") + minuscula.slice(1);
    })
    .join(" ");
}

function item(p: Producto & { image_url: string }) {
  const titulo = tituloLegible(p.name);
  const categoria = categorias.find((c) => c.id === p.category)?.label;
  // Ningún producto tiene descripción todavía; Google exige una.
  const descripcion =
    p.description?.trim() ||
    [
      `${titulo}${p.brand ? ` marca ${tituloLegible(p.brand)}` : ""}.`,
      categoria ? `Categoría: ${categoria}.` : null,
      `Disponible en ${NOMBRE_NEGOCIO}, Duitama, Boyacá: pídelo en línea con domicilio en Duitama o recógelo en la tienda.`,
    ]
      .filter(Boolean)
      .join(" ");

  const campos: [string, string | null][] = [
    ["g:id", p.id],
    ["g:title", titulo],
    ["g:description", descripcion],
    ["g:link", `${SITE_URL}/producto/${encodeURIComponent(p.slug)}`],
    ["g:image_link", p.image_url],
    ["g:availability", "in_stock"],
    ["g:price", `${p.price_cop.toFixed(2)} COP`],
    ["g:condition", "new"],
    ["g:brand", p.brand ? tituloLegible(p.brand) : null],
    // El sku es el código interno del POS, no un GTIN ni un MPN del fabricante.
    ["g:identifier_exists", "no"],
    ["g:product_type", categoria ?? null],
  ];

  return [
    `    <item>`,
    ...campos
      .filter((c): c is [string, string] => c[1] !== null)
      .map(([tag, valor]) => `      <${tag}>${escapeXml(valor)}</${tag}>`),
    `    </item>`,
  ].join("\n");
}

export const Route = createFileRoute("/google-productos.xml")({
  server: {
    handlers: {
      GET: async () => {
        const productos = await listProductos();
        // image_link es obligatorio: los productos sin foto se quedan por fuera.
        const conFoto = productos.filter(
          (p): p is Producto & { image_url: string } => p.image_url !== null,
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">`,
          `  <channel>`,
          `    <title>${escapeXml(NOMBRE_NEGOCIO)}</title>`,
          `    <link>${SITE_URL}/</link>`,
          `    <description>Catálogo de ${escapeXml(NOMBRE_NEGOCIO)}, Duitama</description>`,
          ...conFoto.map(item),
          `  </channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

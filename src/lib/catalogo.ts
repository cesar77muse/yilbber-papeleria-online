import type { Producto } from "./productos.functions";
import type { ShopifyProduct } from "./shopify";

/**
 * Puente entre la base de datos (fuente de verdad del catálogo: nombres,
 * categorías, imágenes y precios en COP) y Shopify (variantes, carrito y
 * checkout). Cada producto sincronizado guarda su `shopify_variant_id`.
 */
export function productoAShopify(p: Producto): ShopifyProduct {
  const precio = { amount: String(p.price_cop), currencyCode: "COP" };
  const imagenes = p.image_url
    ? [{ node: { url: p.image_url, altText: p.name } }]
    : [];

  return {
    node: {
      id: p.id,
      title: p.name,
      description: p.description ?? "",
      handle: p.shopify_handle ?? "",
      productType: p.category,
      priceRange: { minVariantPrice: precio },
      images: { edges: imagenes },
      variants: {
        edges: p.shopify_variant_id
          ? [
              {
                node: {
                  id: p.shopify_variant_id,
                  title: "Default Title",
                  price: precio,
                  availableForSale: true,
                  selectedOptions: [],
                },
              },
            ]
          : [],
      },
      options: [],
    },
  };
}

export const esComprable = (p: Producto) => Boolean(p.shopify_variant_id && p.shopify_handle);

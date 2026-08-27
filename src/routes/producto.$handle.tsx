import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchProductByHandle, formatoPrecio, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { imagenGenerica } from "@/components/tienda/images";

const productoQuery = (handle: string) =>
  queryOptions({
    queryKey: ["shopify-producto", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

export const Route = createFileRoute("/producto/$handle")({
  loader: async ({ context, params }) => {
    const producto = await context.queryClient.ensureQueryData(productoQuery(params.handle));
    if (!producto) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `Producto | Papelería Yilbber` },
      { name: "description", content: `Detalle del producto ${params.handle} en Papelería Yilbber, Duitama.` },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductoPage,
});

function ProductoPage() {
  const { handle } = Route.useParams();
  const { data: node } = useSuspenseQuery(productoQuery(handle));
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  if (!node) return null;

  const producto: ShopifyProduct = { node };
  const img = node.images.edges[0]?.node.url ?? imagenGenerica;
  const variante = node.variants.edges[0]?.node;

  const handleAdd = async () => {
    if (!variante) return;
    await addItem({
      product: producto,
      variantId: variante.id,
      variantTitle: variante.title,
      price: variante.price,
      quantity: cantidad,
      selectedOptions: variante.selectedOptions ?? [],
    });
    toast.success(`${cantidad} × ${node.title} agregado al carrito`, {
      description: "Abre el carrito para finalizar tu compra.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <Link
          to="/pedidos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al catálogo
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <img
            src={img}
            alt={node.images.edges[0]?.node.altText ?? node.title}
            width={1024}
            height={768}
            className="w-full rounded-3xl object-cover shadow-md"
          />
          <div>
            <h1 className="text-2xl uppercase text-brand-navy md:text-3xl">{node.title}</h1>
            <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
            <p className="mt-4 text-base text-muted-foreground">
              {node.description || "Producto de papelería."}
            </p>
            <p className="mt-6 font-display text-2xl text-brand-orange">
              {formatoPrecio(
                node.priceRange.minVariantPrice.amount,
                node.priceRange.minVariantPrice.currencyCode,
              )}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-brand-navy/15">
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  aria-label="Disminuir cantidad"
                  className="p-3 text-brand-navy disabled:opacity-40"
                  disabled={cantidad <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  className="min-w-10 text-center text-sm font-bold text-brand-navy"
                  aria-live="polite"
                >
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.min(99, c + 1))}
                  aria-label="Aumentar cantidad"
                  className="p-3 text-brand-navy disabled:opacity-40"
                  disabled={cantidad >= 99}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={isLoading || !variante?.availableForSale}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                )}
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

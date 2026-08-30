import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getProductoPorSlug } from "@/lib/productos.functions";
import { useCartStore, MAX_POR_PRODUCTO } from "@/stores/cartStore";
import { formatoCOP, imagenDe } from "@/components/tienda/images";

const productoQuery = (slug: string) =>
  queryOptions({
    queryKey: ["catalogo-producto", slug],
    queryFn: () => getProductoPorSlug({ data: { slug } }),
  });

export const Route = createFileRoute("/producto/$slug")({
  loader: async ({ context, params }) => {
    const producto = await context.queryClient.ensureQueryData(productoQuery(params.slug));
    if (!producto) throw notFound();
    return { nombre: producto.name };
  },
  head: ({ loaderData }) => {
    const nombre = loaderData?.nombre ?? "Producto";
    const title = `${nombre} | Papelería Yilbber`;
    const description = `${nombre} disponible en Papelería Yilbber, Duitama. Agrégalo a tu pedido y escríbenos para confirmar.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductoPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl uppercase text-brand-navy">No pudimos cargar el producto</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl uppercase text-brand-navy">Producto no encontrado</h1>
    </div>
  ),
});

function ProductoPage() {
  const { slug } = Route.useParams();
  const { data: producto } = useSuspenseQuery(productoQuery(slug));
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!producto) return null;

  const img = imagenDe(producto.image_url);

  const handleAdd = () => {
    addItem(producto, cantidad);
    toast.success(`${cantidad} × ${producto.name} agregado al carrito`, {
      description: "Abre el carrito para revisar tu pedido.",
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
            alt={producto.name}
            width={1024}
            height={768}
            className="w-full rounded-3xl object-cover shadow-md"
          />
          <div>
            <h1 className="text-2xl uppercase text-brand-navy md:text-3xl">{producto.name}</h1>
            <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
            <p className="mt-4 text-base text-muted-foreground">
              {producto.description || "Producto de papelería."}
            </p>
            <p className="mt-6 font-display text-2xl text-brand-orange">
              {formatoCOP(producto.price_cop)}
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
                  onClick={() => setCantidad((c) => Math.min(MAX_POR_PRODUCTO, c + 1))}
                  aria-label="Aumentar cantidad"
                  className="p-3 text-brand-navy disabled:opacity-40"
                  disabled={cantidad >= MAX_POR_PRODUCTO}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.02]"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
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

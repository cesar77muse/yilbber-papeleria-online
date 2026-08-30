import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/tienda/SearchBar";
import { CategoryChips } from "@/components/tienda/CategoryChips";
import { ProductCard } from "@/components/tienda/ProductCard";
import { listProductos } from "@/lib/productos.functions";

const productosQuery = queryOptions({
  queryKey: ["catalogo-productos"],
  queryFn: () => listProductos(),
});

const title = "Pedidos en línea | Papelería Yilbber Duitama";
const description =
  "Explora el catálogo de Papelería Yilbber: cuadernos, útiles escolares, esferos, papel y artículos de oficina. Busca por categoría y arma tu pedido.";

export const Route = createFileRoute("/pedidos")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productosQuery);
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PedidosPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl uppercase text-brand-navy">No pudimos cargar el catálogo</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl uppercase text-brand-navy">Catálogo no disponible</h1>
    </div>
  ),
});

function PedidosPage() {
  const { data: productos } = useSuspenseQuery(productosQuery);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const okCat = categoria === "todos" || p.category === categoria;
      const okQ =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [productos, busqueda, categoria]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <h1 className="mt-5 text-2xl uppercase text-brand-navy md:text-4xl">Pedidos en línea</h1>
        <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Estos son nuestros productos más pedidos. Busca lo que necesitas, elige la cantidad y
          arma tu pedido en el carrito y escríbenos para confirmarlo.
        </p>

        <div className="mt-8 space-y-4">
          <SearchBar valor={busqueda} onChange={setBusqueda} />
          <CategoryChips activa={categoria} onChange={setCategoria} />
        </div>

        <h2 className="mt-10 text-xl uppercase text-brand-navy md:text-2xl">
          Catálogo de productos
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
        </p>

        {filtrados.length === 0 ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-brand-orange/50 p-12 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-brand-orange/60" aria-hidden="true" />
            <p className="mt-4 text-sm text-muted-foreground">
              {productos.length === 0
                ? "Aún no hay productos publicados en la tienda. Vuelve muy pronto o escríbenos por WhatsApp."
                : "No encontramos productos con esa búsqueda. Escríbenos por WhatsApp y te ayudamos."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

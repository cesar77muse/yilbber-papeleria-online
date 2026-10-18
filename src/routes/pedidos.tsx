import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Catalogo, validarBusquedaCatalogo } from "@/components/tienda/Catalogo";
import { getPaginaCatalogo } from "@/lib/productos.functions";
import { canonical } from "@/lib/seo";

const titulo = "Pedidos en línea | Papelería Yilbber Duitama";
const description =
  "Explora el catálogo de Papelería Yilbber: cuadernos, útiles escolares, esferos, papel y artículos de oficina. Busca por categoría y arma tu pedido.";

export const Route = createFileRoute("/pedidos")({
  validateSearch: validarBusquedaCatalogo,
  loaderDeps: ({ search }) => ({ pagina: search.pagina ?? 1, q: search.q }),
  loader: async ({ deps }) => {
    const datos = await getPaginaCatalogo({ data: deps });
    if (deps.pagina > datos.paginas) throw notFound();
    return { datos, q: deps.q };
  },
  head: ({ loaderData }) => {
    const pagina = loaderData?.datos.pagina ?? 1;
    const title = pagina > 1 ? `Pedidos en línea, página ${pagina} | Papelería Yilbber` : titulo;
    // Cada página se canoniza a sí misma; las búsquedas no se indexan.
    const { meta, links } = canonical(pagina > 1 ? `/pedidos?pagina=${pagina}` : "/pedidos");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(loaderData?.q ? [{ name: "robots", content: "noindex, follow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...meta,
      ],
      links,
    };
  },
  component: PedidosPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl uppercase text-brand-navy">No pudimos cargar el catálogo</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl uppercase text-brand-navy">Esta página del catálogo no existe</h1>
      <Link to="/pedidos" className="mt-4 inline-block font-semibold text-brand-orange">
        Ver el catálogo desde el inicio
      </Link>
    </div>
  ),
});

function PedidosPage() {
  const { datos, q } = Route.useLoaderData();

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
          Estos son nuestros productos más pedidos. Busca lo que necesitas, elige la cantidad y arma
          tu pedido en el carrito y escríbenos para confirmarlo.
        </p>

        <Catalogo
          datos={datos}
          q={q}
          ruta={{ to: "/pedidos" }}
          activa="todos"
          titulo="Catálogo de productos"
        />
      </main>
      <Footer />
    </div>
  );
}

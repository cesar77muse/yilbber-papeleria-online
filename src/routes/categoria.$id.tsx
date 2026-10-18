import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Catalogo, validarBusquedaCatalogo } from "@/components/tienda/Catalogo";
import { categorias } from "@/components/tienda/images";
import { POR_PAGINA, getPaginaCatalogo } from "@/lib/productos.functions";
import { canonical, datosCategoria, jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/categoria/$id")({
  validateSearch: validarBusquedaCatalogo,
  loaderDeps: ({ search }) => ({ pagina: search.pagina ?? 1, q: search.q }),
  loader: async ({ params, deps }) => {
    const categoria = categorias.find((c) => c.id === params.id && c.id !== "todos");
    if (!categoria) throw notFound();
    const datos = await getPaginaCatalogo({ data: { ...deps, categoria: categoria.id } });
    if (deps.pagina > datos.paginas) throw notFound();
    return { categoria, datos, q: deps.q };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { categoria, datos, q } = loaderData;
    const nombre = `${categoria.label} en Duitama`;
    const sufijo = datos.pagina > 1 ? `, página ${datos.pagina}` : "";
    const title = `${nombre}${sufijo} | Papelería Yilbber`;
    const description = `${categoria.label} en Papelería Yilbber, Duitama: ${datos.total} ${
      datos.total === 1 ? "producto" : "productos"
    } con precio. Haz tu pedido en línea y paga en línea o recoge en la tienda.`;
    const base = `/categoria/${params.id}`;
    const path = datos.pagina > 1 ? `${base}?pagina=${datos.pagina}` : base;
    const { meta, links } = canonical(path);
    // Búsquedas y categorías sin productos no se indexan.
    const noIndexar = Boolean(q) || datos.total === 0;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(noIndexar ? [{ name: "robots", content: "noindex, follow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...meta,
      ],
      links,
      scripts: [
        jsonLd(
          datosCategoria({
            nombre,
            description,
            path,
            productos: datos.productos,
            desde: (datos.pagina - 1) * POR_PAGINA + 1,
            total: datos.total,
          }),
        ),
      ],
    };
  },
  component: CategoriaPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl uppercase text-brand-navy">No pudimos cargar la categoría</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl uppercase text-brand-navy">Categoría no encontrada</h1>
      <Link to="/pedidos" className="mt-4 inline-block font-semibold text-brand-orange">
        Ver todo el catálogo
      </Link>
    </div>
  ),
});

function CategoriaPage() {
  const { categoria, datos, q } = Route.useLoaderData();
  const total = datos.conteos[categoria.id] ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <Link
          to="/pedidos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Todo el catálogo
        </Link>

        <h1 className="mt-5 text-2xl uppercase text-brand-navy md:text-4xl">
          {categoria.label} en Duitama
        </h1>
        <div className="mt-2 h-1 w-24 rounded-full bg-brand-orange" />
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {total > 0
            ? `En Papelería Yilbber tenemos ${total} ${total === 1 ? "producto" : "productos"} de ${categoria.label.toLowerCase()} con precio publicado.`
            : `Por ahora no tenemos productos de ${categoria.label.toLowerCase()} publicados en la tienda en línea.`}{" "}
          Elige la cantidad, agrégalos al carrito y arma tu pedido: lo pagas en línea o lo recoges
          en la tienda en Duitama.
        </p>

        <Catalogo
          datos={datos}
          q={q}
          ruta={{ to: "/categoria/$id", params: { id: categoria.id } }}
          activa={categoria.id}
          titulo={`Productos de ${categoria.label.toLowerCase()}`}
        />
      </main>
      <Footer />
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { categorias } from "@/components/tienda/images";

export type Producto = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_cop: number;
  sku: string | null;
  brand: string | null;
  image_url: string | null;
  slug: string;
};

const SELECT = "id, name, description, category, price_cop, sku, brand, image_url, slug";

function supabaseServer() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listProductos = createServerFn({ method: "GET" }).handler(
  async (): Promise<Producto[]> => {
    const { data, error } = await supabaseServer()
      .from("products")
      .select(SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(2000);

    if (error) throw error;
    return (data ?? []) as Producto[];
  },
);

export const getProductoPorSlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data: input }): Promise<Producto | null> => {
    const { data, error } = await supabaseServer()
      .from("products")
      .select(SELECT)
      .eq("is_active", true)
      .eq("slug", input.slug)
      .maybeSingle();

    if (error) throw error;
    return (data as Producto | null) ?? null;
  });

export type ProductoSitemap = Pick<Producto, "slug" | "name" | "image_url" | "category"> & {
  updated_at: string;
};

/** Productos activos para sitemap.xml: lo justo para cada <url>. */
export const listProductosSitemap = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductoSitemap[]> => {
    const { data, error } = await supabaseServer()
      .from("products")
      .select("slug, name, image_url, category, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(5000);

    if (error) throw error;
    return data ?? [];
  },
);

export const POR_PAGINA = 48;

export type FiltroCatalogo = {
  categoria?: string | undefined;
  q?: string | undefined;
  pagina: number;
};

export type PaginaCatalogo = {
  productos: Producto[];
  total: number;
  pagina: number;
  paginas: number;
  /** Productos activos por categoría (sin el filtro de búsqueda), para los chips. */
  conteos: Record<string, number>;
};

/**
 * Una página del catálogo. La búsqueda y el filtro se hacen aquí, en el
 * servidor, para que el HTML sólo lleve los productos de la página y no los
 * ~850 del catálogo.
 */
export const getPaginaCatalogo = createServerFn({ method: "GET" })
  .validator((data: FiltroCatalogo) => data)
  .handler(async ({ data: filtro }): Promise<PaginaCatalogo> => {
    const { data, error } = await supabaseServer()
      .from("products")
      .select(SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(2000);

    if (error) throw error;
    const todos = (data ?? []) as Producto[];

    const conteos: Record<string, number> = {};
    for (const p of todos) conteos[p.category] = (conteos[p.category] ?? 0) + 1;

    const q = (filtro.q ?? "").trim().toLowerCase();
    const etiquetas = new Map(categorias.map((c) => [c.id, c.label.toLowerCase()]));
    const filtrados = todos.filter((p) => {
      const okCat = !filtro.categoria || p.category === filtro.categoria;
      const okQ =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        // "cuaderno" también encuentra los argollados y cosidos de Cuadernos.
        (etiquetas.get(p.category) ?? "").includes(q);
      return okCat && okQ;
    });

    const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const pagina = Math.max(1, Math.floor(filtro.pagina) || 1);
    const inicio = (pagina - 1) * POR_PAGINA;

    return {
      productos: filtrados.slice(inicio, inicio + POR_PAGINA),
      total: filtrados.length,
      pagina,
      paginas,
      conteos,
    };
  });

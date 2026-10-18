import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

export type ProductoSitemap = Pick<Producto, "slug" | "name" | "image_url"> & {
  updated_at: string;
};

/** Productos activos para sitemap.xml: lo justo para cada <url>. */
export const listProductosSitemap = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductoSitemap[]> => {
    const { data, error } = await supabaseServer()
      .from("products")
      .select("slug, name, image_url, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(5000);

    if (error) throw error;
    return data ?? [];
  },
);

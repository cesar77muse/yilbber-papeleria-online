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
  shopify_variant_id: string | null;
  shopify_handle: string | null;
};

const SELECT =
  "id, name, description, category, price_cop, sku, brand, image_url, shopify_variant_id, shopify_handle";

export const listProductos = createServerFn({ method: "GET" }).handler(async (): Promise<Producto[]> => {
  const supabase = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(2000);

  if (error) throw error;
  return (data ?? []) as Producto[];
});

export const getProductoPorHandle = createServerFn({ method: "GET" })
  .inputValidator((data: { handle: string }) => data)
  .handler(async ({ data: input }): Promise<Producto | null> => {
    const supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabase
      .from("products")
      .select(SELECT)
      .eq("is_active", true)
      .eq("shopify_handle", input.handle)
      .maybeSingle();

    if (error) throw error;
    return (data as Producto | null) ?? null;
  });

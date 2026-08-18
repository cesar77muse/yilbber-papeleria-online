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
};

export const listProductos = createServerFn({ method: "GET" }).handler(async (): Promise<Producto[]> => {
  const supabase = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price_cop, sku, brand, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Producto[];
});
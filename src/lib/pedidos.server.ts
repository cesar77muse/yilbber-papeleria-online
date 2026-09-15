import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { MINIMO_DOMICILIO_COP } from "@/components/site/data";
import type { Cliente } from "@/lib/pedidos.schema";

/**
 * Armado del pedido en el servidor, común a Nequi y ePayco.
 *
 * Los precios se vuelven a leer de `products`: nunca se confía en el precio que
 * llega del navegador. Cargar sólo desde handlers de servidor con import dinámico.
 */

type PedidoInsert = Database["public"]["Tables"]["orders"]["Insert"];

export type LineaPedido = {
  product_id: string;
  name: string;
  sku: string | null;
  slug: string;
  unit_price_cop: number;
  quantity: number;
  line_total_cop: number;
};

export const formatoCOP = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

export async function armarLineas(
  items: { id: string; quantity: number }[],
  entrega: Cliente["entrega"],
): Promise<{ lineas: LineaPedido[]; total: number }> {
  // Precios reales, desde la base, sólo de productos activos.
  const ids = [...new Set(items.map((i) => i.id))];
  const { data: productos, error } = await supabaseAdmin
    .from("products")
    .select("id, name, sku, slug, price_cop")
    .eq("is_active", true)
    .in("id", ids);

  if (error) throw error;

  const porId = new Map((productos ?? []).map((p) => [p.id, p]));
  if (ids.some((id) => !porId.has(id))) {
    throw new Error(
      "Algunos productos de tu carrito ya no están disponibles. Vuelve al carrito y quítalos para continuar.",
    );
  }

  const lineas = items.map((item) => {
    const producto = porId.get(item.id)!;
    return {
      product_id: producto.id,
      name: producto.name,
      sku: producto.sku,
      slug: producto.slug,
      unit_price_cop: producto.price_cop,
      quantity: item.quantity,
      line_total_cop: producto.price_cop * item.quantity,
    };
  });

  const total = lineas.reduce((suma, l) => suma + l.line_total_cop, 0);

  // El domicilio en Duitama sólo aplica a partir del mínimo: se valida acá
  // con el total real (precios de la base), no con lo que mande el cliente.
  if (entrega === "domicilio" && total < MINIMO_DOMICILIO_COP) {
    throw new Error(
      `El domicilio en Duitama es para pedidos desde ${formatoCOP(MINIMO_DOMICILIO_COP)}. Tu pedido suma ${formatoCOP(total)}: agrega más productos o recoge en la papelería.`,
    );
  }

  return { lineas, total };
}

export function datosCliente(cliente: Cliente) {
  return {
    customer_name: cliente.nombre,
    customer_phone: cliente.telefono,
    customer_email: cliente.correo || null,
    delivery_method: cliente.entrega,
    delivery_address: cliente.entrega === "domicilio" ? cliente.direccion : null,
    notes: cliente.notas || null,
  };
}

/** Inserta pedido + líneas. Si las líneas fallan, no deja el pedido a medias. */
export async function guardarPedido(pedido: PedidoInsert, lineas: LineaPedido[]) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(pedido)
    .select("id, order_number")
    .single();

  if (error || !data) throw error ?? new Error("No pudimos registrar el pedido");

  const { error: errorItems } = await supabaseAdmin
    .from("order_items")
    .insert(lineas.map((l) => ({ ...l, order_id: data.id })));

  if (errorItems) {
    await supabaseAdmin.from("orders").delete().eq("id", data.id);
    throw errorItems;
  }

  return data;
}

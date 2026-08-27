import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ZoomIn, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatoPrecio, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { imagenGenerica } from "./images";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  const { node } = product;
  const img = node.images.edges[0]?.node.url ?? imagenGenerica;
  const variante = node.variants.edges[0]?.node;

  const handleAdd = async () => {
    if (!variante) return;
    await addItem({
      product,
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
    <article className="flex flex-col overflow-hidden rounded-3xl border border-brand-navy/10 bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full cursor-zoom-in"
            aria-label={`Ampliar imagen de ${node.title}`}
          >
            <img
              src={img}
              alt={node.images.edges[0]?.node.altText ?? node.title}
              loading="lazy"
              width={1024}
              height={768}
              className="h-44 w-full object-cover"
            />
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-brand-navy/80 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
              Ampliar
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-lg uppercase text-brand-navy">{node.title}</DialogTitle>
          <DialogDescription>{node.description || "Producto de papelería."}</DialogDescription>
          <img
            src={img}
            alt={node.title}
            width={1024}
            height={768}
            className="mt-2 w-full rounded-2xl object-cover"
          />
          <p className="font-display text-xl text-brand-orange">
            {formatoPrecio(
              node.priceRange.minVariantPrice.amount,
              node.priceRange.minVariantPrice.currencyCode,
            )}
          </p>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/producto/$handle"
          params={{ handle: node.handle }}
          className="text-sm font-bold uppercase leading-snug text-brand-navy hover:text-brand-orange"
        >
          {node.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{node.description}</p>
        <p className="mt-3 font-display text-lg text-brand-orange">
          {formatoPrecio(
            node.priceRange.minVariantPrice.amount,
            node.priceRange.minVariantPrice.currencyCode,
          )}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-brand-navy/15">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              aria-label={`Disminuir cantidad de ${node.title}`}
              className="p-2 text-brand-navy disabled:opacity-40"
              disabled={cantidad <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-bold text-brand-navy" aria-live="polite">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(99, c + 1))}
              aria-label={`Aumentar cantidad de ${node.title}`}
              className="p-2 text-brand-navy disabled:opacity-40"
              disabled={cantidad >= 99}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isLoading || !variante?.availableForSale}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-navy px-3 py-2.5 text-xs font-bold text-secondary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            )}
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

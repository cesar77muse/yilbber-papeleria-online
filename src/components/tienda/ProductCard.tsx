import { useState } from "react";
import { Minus, Plus, ZoomIn, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatoCOP, imagenDe } from "./images";
import type { Producto } from "@/lib/productos.functions";

export function ProductCard({ producto }: { producto: Producto }) {
  const [cantidad, setCantidad] = useState(1);
  const img = imagenDe(producto.image_url);

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-brand-navy/10 bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full cursor-zoom-in"
            aria-label={`Ampliar imagen de ${producto.name}`}
          >
            <img
              src={img}
              alt={producto.name}
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
          <DialogTitle className="text-lg uppercase text-brand-navy">{producto.name}</DialogTitle>
          <DialogDescription>{producto.description ?? "Producto de papelería."}</DialogDescription>
          <img
            src={img}
            alt={producto.name}
            width={1024}
            height={768}
            className="mt-2 w-full rounded-2xl object-cover"
          />
          <p className="font-display text-xl text-brand-orange">{formatoCOP(producto.price_cop)}</p>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-bold uppercase leading-snug text-brand-navy">{producto.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{producto.description}</p>
        <p className="mt-3 font-display text-lg text-brand-orange">
          {formatoCOP(producto.price_cop)}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-brand-navy/15">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              aria-label={`Disminuir cantidad de ${producto.name}`}
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
              aria-label={`Aumentar cantidad de ${producto.name}`}
              className="p-2 text-brand-navy disabled:opacity-40"
              disabled={cantidad >= 99}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              toast("Carrito en construcción", {
                description: `${cantidad} × ${producto.name}. Muy pronto podrás finalizar tu pedido en línea.`,
              })
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-navy px-3 py-2.5 text-xs font-bold text-secondary-foreground transition-transform hover:scale-[1.03]"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
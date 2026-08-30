import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore, totalCOP, totalUnidades } from "@/stores/cartStore";
import { formatoCOP, imagenDe } from "./images";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  // El carrito vive en localStorage: hasta que el cliente hidrate, mostramos
  // el estado vacío para que el HTML del servidor y el del navegador coincidan.
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const visibles = hidratado ? items : [];
  const unidades = totalUnidades(visibles);
  const total = totalCOP(visibles);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={unidades > 0 ? `Abrir carrito, ${unidades} productos` : "Abrir carrito"}
          className="relative inline-flex items-center justify-center rounded-full border border-brand-navy/20 p-2.5 text-brand-navy transition-colors hover:border-brand-orange hover:text-brand-orange"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {unidades > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-primary-foreground">
              {unidades}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Tu carrito</SheetTitle>
          <SheetDescription>
            {unidades === 0
              ? "Tu carrito está vacío"
              : `${unidades} ${unidades === 1 ? "producto" : "productos"} en tu carrito`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {visibles.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingCart
                  className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {visibles.map((item) => (
                    <div key={item.id} className="flex gap-4 p-2">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary/20">
                        <img
                          src={imagenDe(item.imageUrl)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium">{item.name}</h4>
                        <p className="font-semibold">{formatoCOP(item.priceCop)}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-2">
                        <button
                          type="button"
                          aria-label={`Quitar ${item.name} del carrito`}
                          className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Disminuir cantidad de ${item.name}`}
                            className="rounded-md border border-border p-1"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            className="rounded-md border border-border p-1"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 border-t bg-background pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">{formatoCOP(total)}</span>
                </div>
                <button
                  type="button"
                  disabled
                  aria-describedby="checkout-nota"
                  className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground opacity-50"
                >
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Pago en línea — próximamente
                </button>
                <p id="checkout-nota" className="text-center text-xs text-muted-foreground">
                  Aún no tenemos pagos en línea. Escríbenos por WhatsApp con tu pedido y te
                  confirmamos disponibilidad y forma de pago.
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

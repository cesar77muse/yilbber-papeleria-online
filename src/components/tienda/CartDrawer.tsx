import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatoPrecio } from "@/lib/shopify";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={totalItems > 0 ? `Abrir carrito, ${totalItems} productos` : "Abrir carrito"}
          className="relative inline-flex items-center justify-center rounded-full border border-brand-navy/20 p-2.5 text-brand-navy transition-colors hover:border-brand-orange hover:text-brand-orange"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Tu carrito</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Tu carrito está vacío"
              : `${totalItems} ${totalItems === 1 ? "producto" : "productos"} en tu carrito`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? (
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
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-2">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary/20">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium">{item.product.node.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedOptions.map((option) => option.value).join(" • ")}
                        </p>
                        <p className="font-semibold">
                          {formatoPrecio(item.price.amount, item.price.currencyCode)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-2">
                        <button
                          type="button"
                          aria-label={`Quitar ${item.product.node.title} del carrito`}
                          className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Disminuir cantidad"
                            className="rounded-md border border-border p-1"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Aumentar cantidad"
                            className="rounded-md border border-border p-1"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
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
                  <span className="text-xl font-bold">
                    {formatoPrecio(
                      totalPrice.toFixed(2),
                      items[0]?.price.currencyCode ?? "USD",
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isLoading || isSyncing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Finalizar compra con Shopify
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { Link } from "@tanstack/react-router";
import { ShoppingCart, Sparkles } from "lucide-react";

export function Pedidos() {
  return (
    <section id="pedidos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-brand-orange/60 bg-card p-8 text-center md:p-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Ya puedes explorar el catálogo
        </span>

        <h2 className="mx-auto mt-6 max-w-2xl text-2xl uppercase text-brand-navy md:text-4xl">
          Pedidos en línea
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Mira nuestros productos más pedidos con precios, busca lo que necesitas y elige la
          cantidad. El carrito y el pago en línea llegarán muy pronto.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/pedidos"
            className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Ver catálogo y precios
          </Link>
        </div>
      </div>
    </section>
  );
}
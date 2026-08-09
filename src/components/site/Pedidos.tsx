import { ShoppingCart, Hammer } from "lucide-react";

export function Pedidos() {
  return (
    <section id="pedidos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-brand-orange/60 bg-card p-8 text-center md:p-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
          <Hammer className="h-4 w-4" aria-hidden="true" />
          Próximamente
        </span>

        <h2 className="mx-auto mt-6 max-w-2xl text-2xl uppercase text-brand-navy md:text-4xl">
          Pedidos en línea
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Estamos construyendo nuestra tienda en línea para que puedas armar tu lista escolar o el
          pedido de tu oficina desde el celular. Mientras la terminamos, te esperamos en nuestras dos
          sedes en Duitama.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <ShoppingCart className="h-14 w-14 text-brand-orange/50" aria-hidden="true" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sección en construcción
        </p>
      </div>
    </section>
  );
}
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import logo from "@/assets/logo-yilbber.png";
import { CartDrawer } from "@/components/tienda/CartDrawer";
import { whatsappUrl } from "./data";

const links = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#productos", label: "Productos" },
  { href: "/pedidos", label: "Pedidos en línea" },
  { href: "/#resenas", label: "Reseñas" },
  { href: "/#contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="/#inicio" className="flex items-center gap-2">
          <img src={logo} alt="Publigráficas Yilbber" className="h-9 w-auto md:h-11" />
          <span className="sr-only">Papelería Yilbber</span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-brand-navy transition-colors hover:text-brand-orange"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartDrawer />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Escríbenos por WhatsApp"
            className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="rounded-md p-2 text-brand-navy lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-brand-cream lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm font-semibold text-brand-navy"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
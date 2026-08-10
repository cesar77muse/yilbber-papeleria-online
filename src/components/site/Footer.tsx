import logo from "@/assets/logo-yilbber.png";
import { sedes, EMAIL } from "./data";

export function Footer() {
  return (
    <footer className="bg-brand-navy py-12 text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <img
            src={logo}
            alt="Publigráficas Yilbber"
            loading="lazy"
            className="h-10 w-auto brightness-0 invert"
          />
          <p className="font-script mt-4 text-2xl text-brand-orange-soft">
            Creciendo contigo desde hace 40 años.
          </p>
        </div>

        <div>
          <h3 className="text-sm uppercase text-brand-orange-soft">Sedes</h3>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/80">
            {sedes.map((s) => (
              <li key={s.nombre}>
                <span className="font-semibold">{s.nombre}:</span> {s.direccion}, {s.ciudad}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase text-brand-orange-soft">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/80">
            <li>
              <a href={`mailto:${EMAIL}`} className="hover:text-brand-orange-soft">
                {EMAIL}
              </a>
            </li>
            <li>311 234 7090 · 321 878 6089</li>
            <li>WhatsApp 321 451 2343</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl space-y-1 px-4 text-xs text-secondary-foreground/60">
        <p>
          © {new Date().getFullYear()} Papelería Yilbber · Publigráficas Yilbber. Duitama, Boyacá,
          Colombia.
        </p>
        <p>© 2026 JCL Industries. All rights reserved.</p>
      </div>
    </footer>
  );
}
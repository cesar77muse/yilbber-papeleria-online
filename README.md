# Papelería Yilbber — sitio web y pedidos en línea

Sitio de Papelería Yilbber (Duitama, Boyacá): catálogo, carrito y checkout con
pago en línea (ePayco) o transferencia Nequi.

- **Producción:** https://papeleriayilbber.app (Vercel, se despliega con cada push a `main`)
- **Stack:** TanStack Start (React 19) + Vite + Tailwind v4, Nitro para el servidor
- **Base de datos:** Supabase (tablas `products`, `orders`, `order_items`, `contact_messages`; migraciones en `supabase/migrations`)

## Desarrollo local

Necesitas Node 22 y [Bun](https://bun.sh) (el lockfile es `bun.lock`).

```sh
bun install
bun run dev        # http://localhost:8080
```

Las variables públicas están en `.env` (versionado). Las secretas van en `.env.local`,
que no se sube al repo:

```sh
SUPABASE_SERVICE_ROLE_KEY=...
EPAYCO_CUST_ID=...
EPAYCO_P_KEY=...
EPAYCO_PUBLIC_KEY=...
EPAYCO_PRIVATE_KEY=...
EPAYCO_TEST=true   # true = sandbox, false = cobros reales
```

## Despliegue (Vercel)

Vercel construye con `vite build`; Nitro detecta Vercel y genera `.vercel/output`.
En Vercel → Settings → Environment Variables deben estar, además de las de
`.env.local`: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SITE_URL`. El servidor
las lee en tiempo de ejecución; sólo las `VITE_*` se toman de `.env` al compilar.

La confirmación de pagos de ePayco llega a `${SITE_URL}/api/epayco/confirmacion`,
así que `SITE_URL` debe ser el dominio que sirve el sitio sin redirecciones.

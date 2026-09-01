-- Pedidos en línea con pago por transferencia Nequi.
--
-- El cliente arma el carrito, transfiere a la cuenta Nequi de la papelería y
-- adjunta el screenshot del comprobante. El pedido queda en estado
-- 'pendiente_verificacion' hasta que un trabajador confirme la transferencia.
--
-- Nada de esto es escribible desde el navegador: las dos tablas tienen RLS
-- activo y sin políticas, así que sólo el service_role (usado en las server
-- functions de TanStack Start) puede leer y escribir. El comprobante vive en el
-- bucket privado `comprobantes` de Storage; aquí sólo guardamos su ruta.

-- Consecutivo legible para que el cliente y el trabajador hablen del mismo pedido.
CREATE SEQUENCE IF NOT EXISTS public.orders_number_seq START 1000;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE
    DEFAULT 'YB-' || lpad(nextval('public.orders_number_seq')::text, 5, '0'),

  -- Datos de contacto del cliente (pedido de invitado, todavía no hay cuentas).
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- Entrega
  delivery_method TEXT NOT NULL DEFAULT 'recoger'
    CHECK (delivery_method IN ('recoger', 'domicilio')),
  delivery_address TEXT,
  notes TEXT,

  -- Importes en pesos colombianos, siempre recalculados en el servidor a
  -- partir de products.price_cop (nunca se confía en el precio del navegador).
  subtotal_cop INTEGER NOT NULL CHECK (subtotal_cop >= 0),
  total_cop INTEGER NOT NULL CHECK (total_cop >= 0),

  -- Pago
  payment_method TEXT NOT NULL DEFAULT 'nequi' CHECK (payment_method IN ('nequi')),
  payment_reference TEXT,
  payment_proof_path TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pendiente_verificacion'
    CHECK (status IN ('pendiente_verificacion', 'pago_confirmado', 'alistando', 'listo', 'entregado', 'cancelado')),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,

  -- Si un producto se borra del catálogo el pedido histórico no se pierde:
  -- por eso copiamos nombre, sku y precio en el momento de la compra.
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  slug TEXT,
  unit_price_cop INTEGER NOT NULL CHECK (unit_price_cop >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_cop INTEGER NOT NULL CHECK (line_total_cop >= 0),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Sin GRANT para anon/authenticated: el catálogo es público, los pedidos no.
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT USAGE ON SEQUENCE public.orders_number_seq TO service_role;

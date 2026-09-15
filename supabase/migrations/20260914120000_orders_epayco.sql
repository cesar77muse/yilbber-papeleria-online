-- Pago en línea con ePayco (tarjeta crédito/débito y PSE), además de Nequi.
--
-- Un pedido ePayco nace en 'pendiente_pago' antes de abrir el checkout y lo
-- mueve el servidor cuando ePayco confirma la transacción (webhook firmado o
-- consulta directa a ePayco desde la página de respuesta):
--   aceptada  -> 'pago_confirmado'
--   rechazada -> 'pago_rechazado'
-- No lleva comprobante: la prueba de pago es la referencia de ePayco.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('nequi', 'epayco'));

-- El comprobante sigue siendo obligatorio, pero sólo para Nequi.
ALTER TABLE public.orders ALTER COLUMN payment_proof_path DROP NOT NULL;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_nequi_requiere_comprobante
  CHECK (payment_method <> 'nequi' OR payment_proof_path IS NOT NULL);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'pendiente_pago',
      'pago_rechazado',
      'pendiente_verificacion',
      'pago_confirmado',
      'alistando',
      'listo',
      'entregado',
      'cancelado'
    )
  );

-- payment_reference ya existe: para ePayco guarda el ref_payco.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_response TEXT,
  ADD COLUMN IF NOT EXISTS payment_test BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

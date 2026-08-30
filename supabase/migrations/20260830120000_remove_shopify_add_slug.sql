-- Retira la integración con Shopify.
-- El catálogo queda dependiendo únicamente de Supabase: las URLs de producto
-- pasan de products.shopify_handle a una columna propia products.slug.
-- Escrita para poder ejecutarse dos veces sin romperse.

-- 1. Nueva columna propia.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Conserva las URLs actuales: el handle de Shopify se vuelve el slug propio.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products'
      AND column_name = 'shopify_handle'
  ) THEN
    UPDATE public.products
    SET slug = shopify_handle
    WHERE slug IS NULL
      AND shopify_handle IS NOT NULL
      AND shopify_handle <> '';
  END IF;
END $$;

-- 3. Para productos sin handle, genera el slug a partir del nombre.
UPDATE public.products
SET slug = trim(BOTH '-' FROM regexp_replace(
      translate(lower(name), 'áéíóúüñ', 'aeiouun'),
      '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 4. Red de seguridad para nombres que no dejan ningún caracter utilizable.
UPDATE public.products
SET slug = 'producto-' || left(id::text, 8)
WHERE slug IS NULL OR slug = '';

-- 5. Desempata slugs repetidos (el más antiguo se queda con el slug limpio).
WITH duplicados AS (
  SELECT id,
         row_number() OVER (PARTITION BY slug ORDER BY sort_order, created_at, id) AS n
  FROM public.products
)
UPDATE public.products p
SET slug = p.slug || '-' || d.n
FROM duplicados d
WHERE d.id = p.id AND d.n > 1;

-- 6. Ahora sí: obligatorio y único.
ALTER TABLE public.products
  ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_slug_key' AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 7. Fuera Shopify.
ALTER TABLE public.products
  DROP COLUMN IF EXISTS shopify_product_id,
  DROP COLUMN IF EXISTS shopify_variant_id,
  DROP COLUMN IF EXISTS shopify_handle,
  DROP COLUMN IF EXISTS synced_at;

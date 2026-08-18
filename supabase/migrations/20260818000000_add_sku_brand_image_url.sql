ALTER TABLE public.products
  ADD COLUMN sku TEXT,
  ADD COLUMN brand TEXT,
  ADD COLUMN image_url TEXT;

ALTER TABLE public.products
  ADD CONSTRAINT products_sku_key UNIQUE (sku);

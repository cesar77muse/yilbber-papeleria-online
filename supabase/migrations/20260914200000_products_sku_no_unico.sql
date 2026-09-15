-- Varios productos pueden compartir el mismo código (SKU) del POS: por ejemplo
-- las tintas Epson 544 y 664 originales y la genérica usan 1230.
-- Se quita la unicidad; queda el índice normal products_sku_idx para las búsquedas.
-- El slug sigue siendo único: es lo que identifica al producto en la URL.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sku_key;

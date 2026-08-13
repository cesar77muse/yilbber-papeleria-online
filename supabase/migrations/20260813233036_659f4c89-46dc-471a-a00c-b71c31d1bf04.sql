CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  price_cop INTEGER NOT NULL CHECK (price_cop >= 0),
  image_key TEXT NOT NULL DEFAULT 'oficina',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE INDEX products_category_idx ON public.products (category);

INSERT INTO public.products (name, description, category, price_cop, image_key, sort_order) VALUES
('Cuaderno cosido 100 hojas', 'Cuaderno cosido tamaño carta, cuadriculado, 100 hojas.', 'cuadernos', 4500, 'cuadernos', 1),
('Cuaderno argollado 5 materias', 'Cuaderno argollado de 5 materias con separadores, 180 hojas.', 'cuadernos', 18500, 'cuadernos', 2),
('Cuaderno ferrocarril 50 hojas', 'Cuaderno ferrocarril para primaria, 50 hojas.', 'cuadernos', 3800, 'cuadernos', 3),
('Agenda diaria 2026', 'Agenda diaria con tapa dura y cinta separadora.', 'cuadernos', 32000, 'cuadernos', 4),
('Libreta de apuntes pequeña', 'Libreta de bolsillo argollada, 80 hojas.', 'cuadernos', 5200, 'cuadernos', 5),
('Colores x 12 unidades', 'Caja de 12 colores de madera, larga duración.', 'escolares', 9500, 'escolares', 6),
('Plastilina x 12 barras', 'Plastilina moldeable no tóxica, 12 colores.', 'escolares', 7800, 'escolares', 7),
('Tijera escolar punta roma', 'Tijera escolar de 13 cm con punta roma.', 'escolares', 4200, 'escolares', 8),
('Pegante en barra 21 g', 'Pegante en barra lavable, ideal para papel y cartulina.', 'escolares', 4800, 'escolares', 9),
('Regla de 30 cm', 'Regla plástica transparente de 30 cm.', 'escolares', 2500, 'escolares', 10),
('Borrador de nata', 'Borrador de nata suave, no mancha el papel.', 'escolares', 1200, 'escolares', 11),
('Esfero negro (unidad)', 'Esfero de tinta negra, punta media.', 'escritura', 1500, 'escritura', 12),
('Esferos surtidos x 5', 'Paquete de 5 esferos en negro, azul y rojo.', 'escritura', 6500, 'escritura', 13),
('Lápiz negro HB x 3', 'Paquete de 3 lápices HB con borrador.', 'escritura', 3600, 'escritura', 14),
('Marcadores permanentes x 4', 'Set de 4 marcadores permanentes de punta redonda.', 'escritura', 11500, 'escritura', 15),
('Resaltadores x 4 colores', 'Resaltadores fluorescentes de punta biselada.', 'escritura', 10500, 'escritura', 16),
('Carpeta plástica oficio', 'Carpeta plástica tamaño oficio con gancho legajador.', 'carpetas', 2800, 'carpetas', 17),
('AZ tamaño carta', 'Carpeta AZ de palanca con lomo ancho, tamaño carta.', 'carpetas', 16500, 'carpetas', 18),
('Sobre de manila carta x 10', 'Paquete de 10 sobres de manila tamaño carta.', 'carpetas', 5500, 'carpetas', 19),
('Resma papel carta 75 g', 'Resma de papel bond blanco, 500 hojas, 75 g.', 'papel', 21500, 'papel', 20),
('Block cuadriculado carta', 'Block de 100 hojas cuadriculadas tamaño carta.', 'papel', 7200, 'papel', 21),
('Cartulina plana (unidad)', 'Pliego de cartulina plana en colores surtidos.', 'papel', 1900, 'papel', 22),
('Cosedora media con ganchos', 'Cosedora metálica media más caja de ganchos.', 'oficina', 18900, 'oficina', 23),
('Notas adhesivas 3x3', 'Taco de notas adhesivas de 100 hojas, 76x76 mm.', 'oficina', 4300, 'oficina', 24);
# Pedidos en línea — Vista inicial de catálogo

Primera etapa de la tienda: una página `/pedidos` con catálogo de productos, buscador, filtros por categoría, selector de cantidad y vista ampliada de la imagen. El carrito y el checkout (cuenta o invitado) vienen en la siguiente etapa.

## Qué verá el cliente

1. **Encabezado de la sección**
   Título "Pedidos en línea", texto corto y aviso de que estamos cargando el catálogo completo poco a poco.

2. **Buscador**
   Barra de búsqueda por nombre del producto, con resultados instantáneos mientras escribe. El texto buscado queda en la dirección web, así que el cliente puede compartir o guardar el enlace de una búsqueda.

3. **Filtros por categoría**
   Botones tipo chip: Todos, Cuadernos y agendas, Útiles escolares, Oficina, Carpetas y archivo, Escritura, Papel. También quedan en la dirección web.

4. **Cuadrícula de productos**
   Cada tarjeta muestra:
   - Imagen del producto (clic o botón de lupa para ampliarla en una ventana con la imagen grande, el nombre, la descripción y el precio).
   - Nombre y categoría.
   - Precio en pesos colombianos.
   - Selector de cantidad (− / número / +).
   - Botón "Agregar al carrito" que por ahora muestra un aviso de confirmación; se conectará al carrito real en la siguiente etapa.

5. **Estado vacío**
   Cuando la búsqueda no arroja resultados: mensaje claro y enlace a WhatsApp para consultar el producto.

6. **Enlaces**
   El encabezado y la sección "Pedidos en línea" de la página principal dejan de decir "Próximamente" y llevan a `/pedidos`. En la página nueva se mantiene una nota de que el pago en línea todavía está en construcción.

## Catálogo inicial

- Se crea la base de datos en Lovable Cloud con una tabla de productos (nombre, descripción, categoría, precio, imagen, activo, orden).
- La cargo con unos 24 productos comunes de papelería (cuadernos, esferos, lápices, colores, marcadores, resmas, carpetas, cosedoras, ganchos, notas adhesivas, agendas, tijeras, pegante, reglas, etc.) con **precios provisionales marcados como referencia**. Cuando me envíes tu lista real, reemplazo nombres y precios sin tocar el diseño.
- Las imágenes: uso las tres que ya existen del portafolio como respaldo por categoría y genero unas cuantas adicionales para las categorías que faltan, en el estilo naranja/azul de la marca.

## Detalles técnicos

- Nueva ruta `src/routes/pedidos.tsx` con `head()` propio (título, descripción, og:title/og:description en español).
- Lectura pública del catálogo mediante una función de servidor sin autenticación, con caché de TanStack Query precargada en el loader; búsqueda y filtro se resuelven en el cliente sobre el catálogo cargado. `q` y `categoria` se manejan como parámetros de búsqueda validados en la URL.
- Tabla `public.products` con RLS activo, política de lectura pública solo para productos activos y permisos explícitos; escrituras reservadas para uso administrativo posterior.
- Componentes nuevos en `src/components/tienda/`: `ProductGrid`, `ProductCard`, `QuantityStepper`, `ProductImageDialog` (diálogo shadcn), `SearchBar`, `CategoryChips`.
- Formato de precios con `Intl.NumberFormat('es-CO')` en un helper compartido.
- Solo tokens de color de la marca, sin colores fijos; imágenes con carga diferida y texto alternativo.

## Siguiente etapa (no incluida ahora)

Carrito persistente, resumen de pedido, y checkout con cuenta o como invitado.

## Pendiente de tu parte

Tu lista real de productos con precios (y, si quieres, fotos propias).

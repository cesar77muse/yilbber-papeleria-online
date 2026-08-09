# Sitio web para Papelería Yilbber

Sitio de una sola página (landing) en español, con navegación por secciones, pensado para clientes en Duitama, Boyacá.

## Secciones

1. **Encabezado / Navegación**
   Logo de Papelería Yilbber + enlaces: Inicio, Quiénes somos, Productos, Pedidos en línea, Reseñas, Contacto.

2. **Portada (Hero)**
   Titular con la frase de marca: "Todo lo que necesitas para estudiar, trabajar y organizarte, en un solo lugar."
   Sello de "40 años" como insignia de confianza y botones hacia Contacto y Productos.

3. **Quiénes somos**
   Descripción del negocio, los 40 años de trayectoria, las dos sedes en Duitama y el enfoque en atención cercana y servicio confiable.

4. **Productos / Portafolio**
   Tarjetas por categoría: cuadernos, carpetas, lápices y esferos, agendas, artículos de escritorio, materiales escolares y productos de oficina. Con nota de que el inventario es más amplio y se puede consultar en tienda.

5. **Pedidos en línea — Próximamente**
   Bloque destacado con etiqueta "Próximamente", explicando que la tienda en línea está en construcción e invitando a visitar las sedes mientras tanto. Sin formularios ni botones activos.

6. **Reseñas de clientes**
   Cuadrícula de testimonios con nombre y calificación en estrellas. Dejo 4 textos de ejemplo claramente marcados para reemplazarlos cuando me envíes las reseñas reales.

7. **Contacto y sedes**
   Dos tarjetas de sede:
   - Sede 1: Carrera 17 #18-26, Duitama, Boyacá
   - Sede 2: Carrera 15 #17-44, Duitama, Boyacá
   Cada una con enlace "Ver en Google Maps". Sin redes sociales (no las tienen). Si me pasas teléfono/WhatsApp y horarios, los agrego aquí.

8. **Pie de página**
   Logo, frase de marca, sedes y aviso de derechos.

## Diseño

- Paleta e identidad tomadas de la imagen de los 40 años. Como aún no la tengo, arranco con una paleta de papelería cálida y profesional (azul tinta, dorado de aniversario, crema papel) y la ajusto a los colores exactos en cuanto subas la imagen.
- El logo se recorta o recrea a partir de la imagen del aniversario; mientras llegue, uso un logotipo tipográfico provisional.
- Tipografía legible y comercial, esquinas suaves, secciones amplias y diseño totalmente adaptable a celular (la mayoría del tráfico será móvil).
- Imágenes generadas para la portada y las categorías (papelería, útiles escolares, artículos de oficina).

## Detalles técnicos

- Se reescribe `src/routes/index.tsx` como página principal, con un componente por sección en `src/components/`.
- Tokens de color y tipografía definidos en `src/styles.css` (sin colores fijos dentro de los componentes).
- SEO en español: título y descripción propios, un solo H1, textos alternativos en imágenes y datos estructurados JSON-LD tipo `LocalBusiness` con las dos direcciones para mejorar la búsqueda local.
- Sin backend: no se requiere base de datos ni inicio de sesión en esta etapa.

## Pendientes de tu parte

- La imagen de los 40 años (logo y colores exactos).
- Los textos de las reseñas reales.
- Teléfono/WhatsApp y horarios de atención, si quieres mostrarlos.
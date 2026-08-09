# Sitio web para Papelería Yilbber (Publigráficas Yilbber)

Sitio web de una sola página en español, con navegación por secciones, para clientes en Duitama, Boyacá. Identidad tomada de la pieza de los 40 años.

## Identidad visual (tomada de la imagen)

- **Naranja de marca** `#F26A21` — botones, acentos, subrayados.
- **Azul marino profundo** `#1B2A56` — encabezado, pie de página, títulos.
- **Crema papel** `#F6F1E7` — fondo general, da el aire cálido de la pieza.
- **Blanco** para tarjetas y contraste.
- Tipografía de titulares condensada y en mayúsculas (como "PUBLIGRAFICAS YILBBER"), acompañada de una cursiva/manuscrita para frases cortas ("En busca de la excelencia", "creciendo contigo") y una tipografía limpia para el texto corrido.
- Detalles gráficos discretos inspirados en la pieza: confeti en colores, curva naranja superior, cinta azul en el bloque de aniversario.
- El logo (monograma "Py" en círculo naranja + nombre) se recrea/recorta de la imagen y se usa en el encabezado y el pie. La pieza de los 40 años se muestra completa como imagen en la sección de aniversario.

## Secciones

1. **Encabezado fijo**
   Logo + navegación: Inicio, Nosotros, Productos, Pedidos en línea, Reseñas, Contacto. Botón de WhatsApp siempre visible. Menú desplegable en celular.

2. **Portada**
   Fondo crema con detalles de confeti. Titular: "Todo lo que necesitas para estudiar, trabajar y organizarte, en un solo lugar." Bajada con "Distribuidor mayorista de productos escolares y de oficina" y sello "40 años en busca de la excelencia". Botones: "Escríbenos por WhatsApp" y "Ver productos".

3. **Quiénes somos**
   Texto con tu descripción del negocio, la trayectoria de 40 años, las dos sedes en Duitama y el enfoque en atención cercana y servicio confiable. Cuatro indicadores: 40 años de experiencia, 2 sedes, atención a colegios y empresas, portafolio amplio.

4. **40 años — Escribiendo nuestra historia**
   Banda azul marino con la imagen del aniversario y las frases de la marca ("Gracias por ser parte de esta historia", "creciendo contigo").

5. **Productos / Portafolio**
   Tarjetas por categoría: cuadernos, carpetas y archivo, lápices y esferos, agendas, artículos de escritorio, materiales escolares, productos de oficina, y venta al por mayor para colegios y empresas. Nota de que el inventario es más amplio y se puede consultar en tienda o por WhatsApp.

6. **Pedidos en línea — Próximamente**
   Bloque destacado con etiqueta "Próximamente", explicando que la tienda en línea está en construcción e invitando a visitar las sedes mientras tanto. Solo aviso visual, sin formularios ni botones activos.

7. **Reseñas de clientes**
   Cuadrícula de testimonios con nombre y estrellas. Dejo 4 textos de ejemplo claramente marcados para reemplazarlos por las reseñas reales que me envíes.

8. **Contacto y sedes**
   - **Sede principal:** Cra. 15 No. 17-44, Duitama, Boyacá — Tel. 311 234 7090 / 321 878 6089
   - **Sucursal:** Cra. 17 No. 18-26, Duitama, Boyacá — WhatsApp 321 451 2343
   - **Correo:** yilbber.gerencia@gmail.com
   Teléfonos como enlaces para llamar, WhatsApp con mensaje predefinido, correo con enlace mailto, y enlace "Ver en Google Maps" por sede. Sin redes sociales. Si me pasas los horarios, los agrego aquí.

9. **Pie de página**
   Logo, frase de marca, sedes, correo y aviso de derechos.

## Detalles técnicos

- Se reescribe `src/routes/index.tsx` como página principal, con un componente por sección en `src/components/`.
- Colores y tipografías definidos como tokens en `src/styles.css` (sin colores fijos dentro de los componentes); fuentes cargadas con `<link>` en la ruta raíz.
- La imagen del aniversario se sube al CDN de assets y el logo se genera a partir de ella para usarlo en encabezado, pie y favicon.
- Imágenes generadas para las categorías de producto (papelería, útiles escolares, artículos de oficina), en el estilo cálido naranja/azul de la marca.
- SEO en español: título y descripción propios, un solo H1, textos alternativos, y JSON-LD `LocalBusiness` con las dos direcciones y los teléfonos para búsqueda local en Duitama.
- Totalmente adaptable a celular (la mayoría del tráfico será móvil). Sin backend: no se requiere base de datos ni inicio de sesión en esta etapa.

## Pendientes de tu parte

- Los textos de las reseñas reales.
- Horarios de atención de cada sede.
- Confirmar si el nombre visible debe ser "Papelería Yilbber" o "Publigráficas Yilbber" (por ahora uso "Publigráficas Yilbber" en el logo y "Papelería Yilbber" en los textos).
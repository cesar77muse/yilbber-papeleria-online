export const WHATSAPP = "573214512343";
export const WHATSAPP_MSG = encodeURIComponent(
  "Hola Papelería Yilbber, quisiera información sobre sus productos.",
);
export const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${WHATSAPP_MSG}`;
export const EMAIL = "yilbber.gerencia@gmail.com";

// Pago por transferencia Nequi (único medio de pago en línea por ahora).
export const NEQUI_NUMERO = "3105990632";
export const NEQUI_NUMERO_VISIBLE = "310 599 0632";
export const NEQUI_TITULAR = "Papelería Yilbber";

// Pedido mínimo para ofrecer domicilio en Duitama. Se valida en el
// frontend (checkout) y de nuevo en el backend (pedidos.functions.ts),
// que es la fuente de verdad porque recalcula el total con precios reales.
export const MINIMO_DOMICILIO_COP = 50000;

/** ePayco sólo acepta transacciones entre $5.000 y $5.000.000 COP. */
export const EPAYCO_MINIMO_COP = 5000;
export const EPAYCO_MAXIMO_COP = 5000000;

export const sedes = [
  {
    nombre: "Sede principal",
    direccion: "Cra. 15 No. 17-44",
    ciudad: "Duitama, Boyacá",
    telefonos: [
      { label: "311 234 7090", tel: "+573112347090" },
      { label: "321 878 6089", tel: "+573218786089" },
    ],
    maps: "https://www.google.com/maps/search/?api=1&query=Papeleria+Yilbber&query_place_id=0x8e6a3f0d1aea5a43:0x53f1faf5bb85d221",
  },
  {
    nombre: "Sucursal",
    direccion: "Cra. 17 No. 18-26",
    ciudad: "Duitama, Boyacá",
    telefonos: [{ label: "321 451 2343 (WhatsApp)", tel: "+573214512343" }],
    maps: "https://www.google.com/maps/search/?api=1&query=Carrera+17+%2318-26+Duitama+Boyaca",
  },
];

// Ficha de Google Maps de la papelería. Actualizar calificación y total a mano.
export const GOOGLE_RESENAS = {
  calificacion: 4.5,
  total: 21,
  url: "https://maps.google.com/?cid=6048891707855327777",
};

// Reseñas reales de Google Maps (nombre + inicial del apellido).
export const resenas = [
  {
    nombre: "Alicia N.",
    texto:
      "Muy amplio y amable el nuevo sitio. Entra mucha luz natural y, como siempre, todos muy amables.",
    estrellas: 5,
  },
  {
    nombre: "Alamo M.",
    texto:
      "Se encuentra la gran mayoría de útiles y textos escolares, además de regalos y otros elementos para oficina. El prestigio del negocio lo hace de los más respetados del sector.",
    estrellas: 5,
  },
  {
    nombre: "Deisy T.",
    texto: "Me gustó por muy buen precio, la recomiendo.",
    estrellas: 5,
  },
];

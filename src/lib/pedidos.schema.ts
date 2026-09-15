import { z } from "zod";

/**
 * Validación compartida del cierre del carrito, sea por Nequi o por ePayco.
 * No tiene secretos: la usan las server functions y puede viajar al navegador.
 */

export const clienteSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre").max(120),
  telefono: z
    .string()
    .trim()
    .min(7, "Escribe un teléfono válido")
    .max(20)
    .regex(/^[0-9+()\s-]+$/, "El teléfono sólo puede tener números"),
  correo: z.union([z.string().trim().email("Correo inválido").max(320), z.literal("")]).default(""),
  entrega: z.enum(["recoger", "domicilio"]),
  direccion: z.string().trim().max(300).default(""),
  notas: z.string().trim().max(1000).default(""),
});

export type Cliente = z.output<typeof clienteSchema>;

export const itemsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1, "Tu carrito está vacío")
  .max(100, "Demasiados productos para un solo pedido");

/** Para `.refine` sobre un objeto con `cliente`: el domicilio necesita dirección. */
export const conDireccionSiDomicilio: [
  (p: { cliente: Cliente }) => boolean,
  { message: string; path: string[] },
] = [
  (p) => p.cliente.entrega !== "domicilio" || p.cliente.direccion.length >= 5,
  { message: "Escribe la dirección de entrega", path: ["cliente", "direccion"] },
];

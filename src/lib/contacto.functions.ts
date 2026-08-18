import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  correo: z.string().trim().email("Correo inválido").max(320),
  mensaje: z.string().trim().min(1, "El mensaje es obligatorio").max(5000),
});

export const enviarMensajeContacto = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      nombre: data.nombre,
      correo: data.correo,
      mensaje: data.mensaje,
    });

    if (error) throw error;

    return { ok: true as const };
  });

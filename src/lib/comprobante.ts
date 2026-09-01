/**
 * Prepara el screenshot del comprobante Nequi antes de mandarlo al servidor.
 *
 * Los pantallazos de celular pesan varios MB; los reescalamos en el navegador a
 * un máximo de 1600 px y los mandamos como JPEG en base64, que es lo que espera
 * `crearPedido`. Los PDF (comprobante descargado desde la app) pasan tal cual.
 */

const MAX_LADO = 1600;
const CALIDAD_JPEG = 0.85;
const MAX_BYTES = 8 * 1024 * 1024;

export const TIPOS_ACEPTADOS = "image/jpeg,image/png,image/webp,application/pdf,image/*";

export type TipoComprobante = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

export type ComprobantePreparado = {
  tipo: TipoComprobante;
  base64: string;
  /** URL para mostrar la miniatura; null cuando es un PDF. */
  previewUrl: string | null;
  bytes: number;
  nombre: string;
};

function leerBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No pudimos leer el archivo"));
    lector.onload = () => {
      const resultado = String(lector.result ?? "");
      const coma = resultado.indexOf(",");
      resolve(coma >= 0 ? resultado.slice(coma + 1) : resultado);
    };
    lector.readAsDataURL(blob);
  });
}

async function comprimirImagen(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Fondo blanco: los PNG con transparencia se verían negros en JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", CALIDAD_JPEG),
    );
  } catch {
    // Formatos que el navegador no sabe decodificar (HEIC de iPhone, por ejemplo).
    return null;
  }
}

export async function prepararComprobante(file: File): Promise<ComprobantePreparado> {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("El archivo pesa más de 25 MB. Toma el pantallazo de nuevo o recórtalo.");
  }

  if (file.type === "application/pdf") {
    if (file.size > MAX_BYTES) throw new Error("El PDF pesa más de 8 MB.");
    return {
      tipo: "application/pdf",
      base64: await leerBase64(file),
      previewUrl: null,
      bytes: file.size,
      nombre: file.name,
    };
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Sube una imagen (JPG, PNG o WEBP) o el PDF del comprobante.");
  }

  const comprimido = await comprimirImagen(file);

  if (comprimido) {
    return {
      tipo: "image/jpeg",
      base64: await leerBase64(comprimido),
      previewUrl: URL.createObjectURL(comprimido),
      bytes: comprimido.size,
      nombre: file.name,
    };
  }

  // Sin compresión sólo aceptamos los tipos que el bucket permite.
  const tiposDirectos: TipoComprobante[] = ["image/jpeg", "image/png", "image/webp"];
  if (!tiposDirectos.includes(file.type as TipoComprobante) || file.size > MAX_BYTES) {
    throw new Error(
      "No pudimos procesar esa imagen. Intenta con un pantallazo en JPG o PNG de menos de 8 MB.",
    );
  }

  return {
    tipo: file.type as TipoComprobante,
    base64: await leerBase64(file),
    previewUrl: URL.createObjectURL(file),
    bytes: file.size,
    nombre: file.name,
  };
}

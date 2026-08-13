import cuadernos from "@/assets/cat-cuadernos.jpg";
import escolares from "@/assets/cat-escolares.jpg";
import oficina from "@/assets/cat-oficina.jpg";
import carpetas from "@/assets/cat-carpetas.jpg";
import escritura from "@/assets/cat-escritura.jpg";
import papel from "@/assets/cat-papel.jpg";

export const imagenes: Record<string, string> = {
  cuadernos,
  escolares,
  oficina,
  carpetas,
  escritura,
  papel,
};

export const imagenDe = (key: string | null) => imagenes[key ?? ""] ?? cuadernos;

export const categorias: { id: string; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "cuadernos", label: "Cuadernos y agendas" },
  { id: "escolares", label: "Útiles escolares" },
  { id: "escritura", label: "Lápices y esferos" },
  { id: "papel", label: "Papel y resmas" },
  { id: "carpetas", label: "Carpetas y archivo" },
  { id: "oficina", label: "Oficina" },
];

export const formatoCOP = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
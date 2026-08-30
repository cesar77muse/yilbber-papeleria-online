import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Producto } from "@/lib/productos.functions";

/**
 * Carrito local. Vive solo en el navegador del cliente (localStorage) hasta
 * que conectemos una pasarela de pago. No habla con ningún servicio externo.
 */
export interface CartItem {
  id: string;
  slug: string;
  name: string;
  priceCop: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (producto: Producto, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const MAX_POR_PRODUCTO = 99;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, quantity = 1) => {
        const items = get().items;
        const existente = items.find((i) => i.id === producto.id);

        if (existente) {
          set({
            items: items.map((i) =>
              i.id === producto.id
                ? { ...i, quantity: Math.min(MAX_POR_PRODUCTO, i.quantity + quantity) }
                : i,
            ),
          });
          return;
        }

        set({
          items: [
            ...items,
            {
              id: producto.id,
              slug: producto.slug,
              name: producto.name,
              priceCop: producto.price_cop,
              imageUrl: producto.image_url,
              quantity: Math.min(MAX_POR_PRODUCTO, Math.max(1, quantity)),
            },
          ],
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(MAX_POR_PRODUCTO, quantity) } : i,
          ),
        });
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "yilbber-carrito",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const totalUnidades = (items: CartItem[]) =>
  items.reduce((suma, i) => suma + i.quantity, 0);

export const totalCOP = (items: CartItem[]) =>
  items.reduce((suma, i) => suma + i.priceCop * i.quantity, 0);

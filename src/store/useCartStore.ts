import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  cartItemId: string; // ID único (productId + hash de configuración)
  productId: string;
  name: string;
  slug: string;
  unitPriceUsd: number;
  quantity: number;
  imageUrl: string;
  isMadeToOrder: boolean;
  estimatedLeadTimeDays: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
  customConfiguration: {
    sizeLabel: string;
    materials: Record<string, string>;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotalUsd: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.cartItemId === newItem.cartItemId
          );
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.cartItemId === newItem.cartItemId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { isOpen: true, items: [...state.items, newItem] };
        }),

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.cartItemId !== cartItemId)
              : state.items.map((i) =>
                  i.cartItemId === cartItemId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),

      getSubtotalUsd: () =>
        Number(
          get()
            .items.reduce(
              (acc, item) => acc + item.unitPriceUsd * item.quantity,
              0
            )
            .toFixed(2)
        ),
    }),
    {
      name: "rmodulares-cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
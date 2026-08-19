import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

// Client-side only for now, per plan §5 — no persistent server-side cart
// table for MVP. Checkout re-validates price/availability server-side
// against product_id; nothing here is trusted at order time.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          }
        }),

      clearCart: () => set({ items: [] }),
    }),
    { name: "berare-cart" }
  )
)

export function useCartCount() {
  return useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
}

export function useCartSubtotal() {
  return useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )
}

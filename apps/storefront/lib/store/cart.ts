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
  isOpen: boolean
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  openCart: () => void
  closeCart: () => void
}

// Client-side only for now, per plan §5 — no persistent server-side cart
// table for MVP. Checkout re-validates price/availability server-side
// against product_id; nothing here is trusted at order time. setItems()
// exists specifically for CartValidator to silently reconcile stored
// items against the current database on app load.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          const items = existing
            ? state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { ...item, quantity }]
          return { items, isOpen: true }
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

      setItems: (items) => set({ items }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "berare-cart",
      // isOpen is transient UI state, not something to restore across
      // reloads — a fresh page load should never come up with the drawer
      // already open.
      partialize: (state) => ({ items: state.items }),
    }
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

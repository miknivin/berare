import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WishlistItem = {
  productId: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  image: string | null
}

type WishlistState = {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  remove: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

// Client-side only, same as the cart store — stores a full snapshot per
// item (not just an id) so the /wishlist page can render without a server
// round-trip, exactly like cart items already do.
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          }
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
    }),
    { name: "berare-wishlist" }
  )
)

export function useWishlistCount() {
  return useWishlistStore((state) => state.items.length)
}

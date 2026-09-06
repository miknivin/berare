"use client"

import { Heart } from "lucide-react"
import { useWishlistStore, type WishlistItem } from "@/lib/store/wishlist"

export function WishlistButton({
  item,
  size = "sm",
}: {
  item: WishlistItem
  size?: "sm" | "lg"
}) {
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(item.productId))
  const toggle = useWishlistStore((state) => state.toggle)

  const dimension = size === "lg" ? "w-11 h-11" : "w-9 h-9"
  const iconSize = size === "lg" ? "w-5 h-5" : "w-4 h-4"

  return (
    <button
      type="button"
      onClick={(e) => {
        // Product cards nest this as a sibling of the card's <Link>, not a
        // descendant — but stopping propagation here still matters since
        // this button sits inside the same clickable card area visually.
        e.preventDefault()
        e.stopPropagation()
        toggle(item)
      }}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={`shrink-0 flex items-center justify-center ${dimension} rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors`}
    >
      <Heart
        className={`${iconSize} transition-colors ${isWishlisted ? "fill-primary text-primary" : "text-foreground"}`}
        aria-hidden="true"
      />
    </button>
  )
}

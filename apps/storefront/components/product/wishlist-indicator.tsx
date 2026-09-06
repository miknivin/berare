"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlistCount } from "@/lib/store/wishlist"

export function WishlistIndicator() {
  const count = useWishlistCount()

  return (
    <Link
      href="/wishlist"
      className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted transition-colors"
      aria-label={`Wishlist with ${count} item${count === 1 ? "" : "s"}`}
    >
      <Heart className="w-5 h-5" aria-hidden="true" />
      <span aria-live="polite" className="sr-only">
        {count} item{count === 1 ? "" : "s"} in wishlist
      </span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}

"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCartCount } from "@/lib/store/cart"

export function CartIndicator() {
  const count = useCartCount()

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted transition-colors"
      aria-label={`Shopping cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="w-5 h-5" aria-hidden="true" />
      <span aria-live="polite" className="sr-only">
        {count} item{count === 1 ? "" : "s"} in cart
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

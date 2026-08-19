"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCartStore, useCartSubtotal } from "@/lib/store/cart"
import { CartItemRow } from "@/components/cart/cart-item-row"
import { formatPrice } from "@/lib/format"

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartSubtotal()

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-40 mb-4" aria-hidden="true" />
        <h1 className="font-heading text-2xl mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Start adding items to your cart.</p>
        <Link
          href="/products"
          className="min-h-11 inline-flex items-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-10">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
          <Link
            href="/products"
            className="inline-block mt-6 text-sm font-medium hover:text-primary transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="md:sticky md:top-24 h-fit rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium mb-4">Order Summary</h2>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Shipping and taxes calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="w-full min-h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

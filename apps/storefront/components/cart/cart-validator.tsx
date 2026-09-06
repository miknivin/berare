"use client"

import { useEffect, useRef } from "react"
import { useCartStore } from "@/lib/store/cart"
import type { ValidatedProduct } from "@/app/api/cart/validate/route"

// Renders nothing — runs once per app load to silently reconcile whatever
// is sitting in localStorage against the real database. A cart item's
// price (or name/slug/image) may be stale by the time someone returns to
// a half-finished cart; this is the client-side half of that check, the
// server route is the actual source of truth. Products no longer
// returned by the API (deleted or no longer active) are dropped
// entirely — nothing here is trusted at checkout anyway, so this is only
// about keeping what the shopper *sees* accurate, not enforcing anything.
export function CartValidator() {
  const hasValidated = useRef(false)

  useEffect(() => {
    if (hasValidated.current) return
    hasValidated.current = true

    const items = useCartStore.getState().items
    if (items.length === 0) return

    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: items.map((item) => item.productId) }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { products?: ValidatedProduct[] } | null) => {
        if (!data?.products) return

        const truthById = new Map(data.products.map((product) => [product.id, product]))
        const current = useCartStore.getState().items
        const reconciled = current
          .filter((item) => truthById.has(item.productId))
          .map((item) => {
            const truth = truthById.get(item.productId)!
            return {
              ...item,
              name: truth.name,
              slug: truth.slug,
              price: truth.price,
              image: truth.image,
            }
          })

        useCartStore.getState().setItems(reconciled)
      })
      .catch(() => {
        // Best-effort — a validation hiccup should never break the app.
      })
  }, [])

  return null
}

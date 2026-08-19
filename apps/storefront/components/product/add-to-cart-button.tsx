"use client"

import { useState } from "react"
import { Minus, Plus, Check } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"
import type { ProductDetail } from "@/lib/data/products"

export function AddToCartButton({ product }: { product: ProductDetail }) {
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  function handleAdd() {
    const primaryImage = [...product.product_images].sort((a, b) => a.position - b.position)[0]
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: primaryImage?.storage_path ?? null,
      },
      quantity
    )
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="min-h-12 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
      >
        {justAdded ? (
          <>
            <Check className="w-4 h-4" aria-hidden="true" />
            Added to Cart
          </>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  )
}

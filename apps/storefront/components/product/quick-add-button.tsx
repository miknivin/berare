"use client"

import { useState } from "react"
import { ShoppingBag, Check } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"
import type { ProductListItem } from "@/lib/data/products"

export function QuickAddButton({ product }: { product: ProductListItem }) {
  const [justAdded, setJustAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const primaryImage = [...product.product_images].sort((a, b) => a.position - b.position)[0]
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage?.storage_path ?? null,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Add to cart"
      className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      {justAdded ? (
        <Check className="w-4 h-4" aria-hidden="true" />
      ) : (
        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  )
}

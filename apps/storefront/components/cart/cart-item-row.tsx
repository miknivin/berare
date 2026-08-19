"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, X, Sparkles } from "lucide-react"
import { useCartStore, type CartItem } from "@/lib/store/cart"
import { formatPrice } from "@/lib/format"
import { getProductImageUrl } from "@/lib/image"

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <Link
        href={`/products/${item.slug}`}
        className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
      >
        {item.image ? (
          <Image
            src={getProductImageUrl(item.image)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <Sparkles className="w-6 h-6 text-muted-foreground opacity-40" aria-hidden="true" />
        )}
      </Link>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:text-primary">
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from cart`}
            className="shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-9 h-9 flex items-center justify-center"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-sm" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-9 h-9 flex items-center justify-center"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  )
}

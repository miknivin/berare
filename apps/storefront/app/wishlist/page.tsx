"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, X, ShoppingBag } from "lucide-react"
import { useWishlistStore, type WishlistItem } from "@/lib/store/wishlist"
import { useCartStore } from "@/lib/store/cart"
import { getProductImageUrl } from "@/lib/image"
import { PriceDisplay } from "@/components/product/price-display"

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items)
  const removeFromWishlist = useWishlistStore((state) => state.remove)
  const addToCart = useCartStore((state) => state.addItem)

  function handleAddToCart(item: WishlistItem) {
    addToCart({ productId: item.productId, name: item.name, slug: item.slug, price: item.price, image: item.image })
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <Heart className="w-10 h-10 text-muted-foreground opacity-40 mb-4" aria-hidden="true" />
        <h1 className="font-heading text-2xl mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">Tap the heart on any product to save it here.</p>
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
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 w-full">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Your Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => (
          <div key={item.productId} className="relative">
            <button
              type="button"
              onClick={() => removeFromWishlist(item.productId)}
              aria-label={`Remove ${item.name} from wishlist`}
              className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <Link href={`/products/${item.slug}`} className="block">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm">
                {item.image ? (
                  <Image
                    src={getProductImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Heart className="w-8 h-8 opacity-40" aria-hidden="true" />
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-sm font-medium line-clamp-2">{item.name}</h3>
              <div className="mt-1">
                <PriceDisplay price={item.price} compareAtPrice={item.compareAtPrice} />
              </div>
            </Link>

            <button
              type="button"
              onClick={() => handleAddToCart(item)}
              className="mt-2 w-full min-h-9 inline-flex items-center justify-center gap-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

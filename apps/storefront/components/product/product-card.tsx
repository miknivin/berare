import Link from "next/link"
import "./product-card.css"
import { ProductImage } from "./product-image"
import { PriceDisplay } from "./price-display"
import { WishlistButton } from "./wishlist-button"
import { QuickAddButton } from "./quick-add-button"
import type { ProductListItem } from "@/lib/data/products"

export function ProductCard({ product }: { product: ProductListItem }) {
  const primaryImage = [...product.product_images].sort((a, b) => a.position - b.position)[0]

  return (
    <div className="product-card-parent">
      <Link href={`/products/${product.slug}`} className="product-card">
        <ProductImage
          images={product.product_images}
          alt={product.name}
          className="product-card__image aspect-square rounded-xl w-full shadow-sm"
        />
        <div className="product-card__info">
          <h3 className="product-card__title mt-3 text-sm font-medium line-clamp-2">{product.name}</h3>
          <div className="mt-1">
            <PriceDisplay price={product.price} compareAtPrice={product.compare_at_price} />
          </div>
        </div>
      </Link>

      {/* Siblings of the Link, not descendants — a <button> can't legally
          nest inside an <a>, and these need independent click handling
          (add to cart / toggle wishlist) rather than navigating. */}
      <div className="product-card__actions absolute top-2 right-2 flex flex-col gap-2">
        <WishlistButton
          item={{
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            compareAtPrice: product.compare_at_price,
            image: primaryImage?.storage_path ?? null,
          }}
        />
        <QuickAddButton product={product} />
      </div>
    </div>
  )
}

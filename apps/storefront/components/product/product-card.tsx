import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { ProductImage } from "./product-image"
import type { ProductListItem } from "@/lib/data/products"

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <ProductImage
        images={product.product_images}
        alt={product.name}
        className="aspect-square rounded-xl w-full shadow-sm group-hover:shadow-md transition-shadow"
      />
      <h3 className="mt-3 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
        {product.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{formatPrice(product.price)}</p>
    </Link>
  )
}

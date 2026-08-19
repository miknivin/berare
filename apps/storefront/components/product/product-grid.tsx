import { ProductCard } from "./product-card"
import type { ProductListItem } from "@/lib/data/products"

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or check back soon for new arrivals.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

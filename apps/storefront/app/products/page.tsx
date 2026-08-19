import type { Metadata } from "next"
import { getProducts } from "@/lib/data/products"
import { getCategories } from "@/lib/data/categories"
import { ProductFilters } from "@/lib/data/product-filters"
import { ProductListing } from "@/components/product/product-listing"

export const metadata: Metadata = {
  title: "All Products",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const rawParams = await searchParams
  const filters = ProductFilters.fromSearchParams(rawParams)

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ])

  return (
    <ProductListing
      title={filters.search ? `Results for "${filters.search}"` : "All Products"}
      products={products}
      total={total}
      totalPages={totalPages}
      filters={filters}
      basePath="/products"
      categories={categories}
    />
  )
}

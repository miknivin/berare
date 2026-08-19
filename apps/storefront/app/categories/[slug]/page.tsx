import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getCategories, getDescendantCategories } from "@/lib/data/categories"
import { getProducts } from "@/lib/data/products"
import { ProductFilters } from "@/lib/data/product-filters"
import { ProductListing } from "@/components/product/product-listing"

async function resolveCategory(slug: string) {
  const categories = await getCategories()
  return categories.find((c) => c.slug === slug) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await resolveCategory(slug)
  return { title: category?.name ?? "Category" }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const category = await resolveCategory(slug)
  if (!category) notFound()

  const categories = await getCategories()
  const descendants = getDescendantCategories(categories, category.id)
  const subcategories = categories.filter((c) => c.parent_id === category.id)

  const rawParams = await searchParams
  // The route's own category (plus any subcategories it has) is always
  // applied and isn't something the filter panel manages/removes — the
  // offcanvas and pills only cover the *additional* categories/price on
  // top of it, so pass a merged set to the query but keep `filters`
  // (unmerged) for the UI.
  const filters = ProductFilters.fromSearchParams(rawParams)
  const queryFilters = new ProductFilters({
    ...filters,
    categorySlugs: Array.from(
      new Set([slug, ...descendants.map((c) => c.slug), ...filters.categorySlugs])
    ),
  })

  const { products, total, totalPages } = await getProducts(queryFilters)

  return (
    <ProductListing
      title={category.name}
      products={products}
      total={total}
      totalPages={totalPages}
      filters={filters}
      basePath={`/categories/${slug}`}
      categories={categories}
      subcategories={subcategories}
    />
  )
}

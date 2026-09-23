import { cache } from "react"
import { unstable_cache } from "next/cache"
import { createPublicSupabaseClient } from "@berare/db/public"

export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_path: string | null
}

// 60s time-based cache (shared across every visitor, not per-request) —
// categories rarely change and this query runs on literally every
// storefront page via Navbar/Footer, so it's the highest-leverage thing to
// cache. Wrapped in the public (cookie-free) client so it's actually
// eligible for unstable_cache, which forbids Dynamic APIs like cookies().
const getCategoriesCached = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id, image_path")
      .order("name")

    if (error) throw error
    return data ?? []
  },
  ["categories"],
  { revalidate: 60 }
)

// React's cache() additionally dedupes within a single request — Navbar
// and Footer both call this without triggering two lookups even when the
// 60s cache above has already expired.
export const getCategories = cache(getCategoriesCached)

// All descendants of a category (children, grandchildren, ...) — used so a
// parent category page can roll up products filed under its subcategories
// instead of only matching its own exact category_id.
export function getDescendantCategories(categories: Category[], parentId: string): Category[] {
  const children = categories.filter((c) => c.parent_id === parentId)
  return children.flatMap((child) => [child, ...getDescendantCategories(categories, child.id)])
}

// Distinct category_ids carrying at least one active product — cheap to
// fetch once for the whole nav so it can decide which categories get a
// dropdown/chevron without loading every product up front.
// unstable_cache serializes its return value as JSON, so this caches the
// array form and only builds the Set once that's back on this side.
const getActiveProductCategoryIdsCached = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase.from("products").select("category_id").eq("status", "active")

    if (error) throw error
    return Array.from(
      new Set((data ?? []).map((p) => p.category_id).filter((id): id is string => id !== null))
    )
  },
  ["active-product-category-ids"],
  { revalidate: 60 }
)

export const getActiveProductCategoryIds = cache(
  async (): Promise<Set<string>> => new Set(await getActiveProductCategoryIdsCached())
)

// Same rollup rule as the category page: a category "has products" if it
// or any of its descendants (subcategories) does.
export function hasProductsUnderCategory(
  categories: Category[],
  activeProductCategoryIds: Set<string>,
  categoryId: string
): boolean {
  if (activeProductCategoryIds.has(categoryId)) return true
  return getDescendantCategories(categories, categoryId).some((c) => activeProductCategoryIds.has(c.id))
}

import { cache } from "react"
import { createServerSupabaseClient } from "@berare/db/server"

export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_path: string | null
}

// React's cache() dedupes this within a single request — Navbar and
// Footer both call it without triggering two DB round trips.
export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, image_path")
    .order("name")

  if (error) throw error
  return data ?? []
})

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
export const getActiveProductCategoryIds = cache(async (): Promise<Set<string>> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("category_id").eq("status", "active")

  if (error) throw error
  return new Set((data ?? []).map((p) => p.category_id).filter((id): id is string => id !== null))
})

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

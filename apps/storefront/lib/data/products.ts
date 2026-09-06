import { createServerSupabaseClient } from "@berare/db/server"
import { getCategories } from "./categories"
import { ProductFilters } from "./product-filters"

export type ProductImage = {
  id: string
  storage_path: string
  position: number
}

export type ProductListItem = {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price: number | null
  currency: string
  category_id: string | null
  product_images: ProductImage[]
}

export type ProductDetail = ProductListItem & {
  description: string | null
  categories: { id: string; name: string; slug: string } | null
}

export type { SortOption } from "./product-filters"

export async function getProducts(filters: ProductFilters) {
  const supabase = await createServerSupabaseClient()
  const categories = await getCategories()

  const baseQuery = supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, currency, category_id, product_images(id, storage_path, position)", {
      count: "exact",
    })
    .eq("status", "active")

  const { data, error, count } = await filters.apply(baseQuery, categories)
  if (error) throw error

  return {
    products: (data ?? []) as ProductListItem[],
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / filters.pageSize)),
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, compare_at_price, currency, category_id, product_images(id, storage_path, position), categories(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle()

  if (error) throw error
  return data as ProductDetail | null
}

export async function getRelatedProducts(categoryId: string | null, excludeProductId: string) {
  if (!categoryId) return []

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, currency, category_id, product_images(id, storage_path, position)")
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(4)

  if (error) throw error
  return (data ?? []) as ProductListItem[]
}

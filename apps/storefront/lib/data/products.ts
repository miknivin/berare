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

const BEST_SELLER_LIMIT = 8
const BEST_SELLER_FALLBACK_COUNT = 5
const DEFAULT_BEST_SELLER_THRESHOLD = 5

const PRODUCT_LIST_SELECT =
  "id, name, slug, price, compare_at_price, currency, category_id, product_images(id, storage_path, position)"

// Products with more than BEST_SELLER_THRESHOLD confirmed/shipped/delivered
// orders, ranked by order count. If nothing has crossed that bar yet (e.g.
// a fresh store), falls back to a random handful of active products rather
// than rendering an empty section.
//
// The homepage awaits this alongside its other sections in one
// Promise.all — a failure here (e.g. a migration that's pending on this
// environment, a transient RPC error) must never throw and take the
// whole page down with it, so every path degrades to an empty list
// instead. This is the one section deliberately allowed to just vanish.
export async function getBestSellers(): Promise<ProductListItem[]> {
  try {
    const threshold = Number(process.env.BEST_SELLER_THRESHOLD ?? DEFAULT_BEST_SELLER_THRESHOLD)
    const supabase = await createServerSupabaseClient()

    const { data: ranked, error: rpcError } = await supabase.rpc("get_best_seller_product_ids", {
      p_threshold: threshold,
      p_limit: BEST_SELLER_LIMIT,
    })
    if (rpcError) throw rpcError

    if (ranked && ranked.length > 0) {
      const ids = ranked.map((row) => row.product_id)
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .in("id", ids)
        .eq("status", "active")

      if (error) throw error

      // .in() doesn't preserve order — re-sort by the RPC's own ranking.
      const byId = new Map((data ?? []).map((product) => [product.id, product]))
      return ids.map((id) => byId.get(id)).filter((product): product is ProductListItem => product != null)
    }

    const { data: pool, error: poolError } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("status", "active")
      .limit(50)

    if (poolError) throw poolError

    const shuffled = [...(pool ?? [])].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, BEST_SELLER_FALLBACK_COUNT) as ProductListItem[]
  } catch (error) {
    console.error("getBestSellers failed, hiding the section instead of failing the homepage:", error)
    return []
  }
}

export async function getRelatedProducts(categoryId: string | null, excludeProductId: string) {
  if (!categoryId) return []

  const supabase = await createServerSupabaseClient()

  // If this product's category is itself a subcategory, also pull from
  // its parent — a subcategory alone often doesn't have enough products
  // to fill "You May Also Like" on its own.
  const { data: category } = await supabase
    .from("categories")
    .select("parent_id")
    .eq("id", categoryId)
    .maybeSingle()

  const categoryIds = category?.parent_id ? [categoryId, category.parent_id] : [categoryId]

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, currency, category_id, product_images(id, storage_path, position)")
    .eq("status", "active")
    .in("category_id", categoryIds)
    .neq("id", excludeProductId)
    .limit(8)

  if (error) throw error

  // Exact subcategory matches first, parent-category ones filling the
  // rest — never the other way around.
  const sorted = [...(data ?? [])].sort((a, b) => {
    const aIsExact = a.category_id === categoryId ? 0 : 1
    const bIsExact = b.category_id === categoryId ? 0 : 1
    return aIsExact - bIsExact
  })

  return sorted.slice(0, 4) as ProductListItem[]
}

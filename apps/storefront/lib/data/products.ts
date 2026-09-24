import { unstable_cache } from "next/cache"
import { createPublicSupabaseClient } from "@berare/db/public"
import { getCategories } from "./categories"
import { ProductFilters, type PlainProductFilters } from "./product-filters"

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
  stock_quantity: number
  product_images: ProductImage[]
}

export type ProductFaq = {
  question: string
  answer: string
}

export type ProductDetail = ProductListItem & {
  description: string | null
  net_volume: string | null
  key_features: string[]
  benefits: string[]
  skin_types: string[]
  key_ingredients: string[]
  what_it_is: string | null
  what_it_does: string | null
  how_it_works: string | null
  full_ingredients: string | null
  directions_to_use: string | null
  faqs: ProductFaq[]
  categories: { id: string; name: string; slug: string } | null
}

export type { SortOption } from "./product-filters"

// Keyed on the filters' plain-object form (categories/price/search/sort/
// page) so different filter combinations get their own 60s cache entry
// instead of colliding. The query builder itself can't cross into
// unstable_cache (not JSON-serializable), so it's built fresh inside on
// each cache miss.
const getProductsCached = unstable_cache(
  async (plainFilters: PlainProductFilters): Promise<{ products: ProductListItem[]; total: number }> => {
    const filters = new ProductFilters(plainFilters)
    const supabase = createPublicSupabaseClient()
    const categories = await getCategories()

    const baseQuery = supabase
      .from("products")
      .select(
        "id, name, slug, price, compare_at_price, currency, category_id, stock_quantity, product_images(id, storage_path, position)",
        { count: "exact" }
      )
      .eq("status", "active")

    const { data, error, count } = await filters.apply(baseQuery, categories)
    if (error) throw error

    return { products: (data ?? []) as ProductListItem[], total: count ?? 0 }
  },
  ["products"],
  { revalidate: 60 }
)

export async function getProducts(filters: ProductFilters) {
  const { products, total } = await getProductsCached(filters.toPlainObject())

  return {
    products,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  }
}

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, description, price, compare_at_price, currency, category_id, net_volume, key_features, benefits, skin_types, key_ingredients, what_it_is, what_it_does, how_it_works, full_ingredients, directions_to_use, faqs, stock_quantity, product_images(id, storage_path, position), categories(id, name, slug)"
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle()

    if (error) throw error
    return data as ProductDetail | null
  },
  ["product-by-slug"],
  { revalidate: 60 }
)

const BEST_SELLER_LIMIT = 8
const BEST_SELLER_FALLBACK_COUNT = 5
const DEFAULT_BEST_SELLER_THRESHOLD = 5

const PRODUCT_LIST_SELECT =
  "id, name, slug, price, compare_at_price, currency, category_id, stock_quantity, product_images(id, storage_path, position)"

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
export const getBestSellers = unstable_cache(
  async (): Promise<ProductListItem[]> => {
    try {
      const threshold = Number(process.env.BEST_SELLER_THRESHOLD ?? DEFAULT_BEST_SELLER_THRESHOLD)
      const supabase = createPublicSupabaseClient()

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
  },
  ["best-sellers"],
  { revalidate: 60 }
)

export const getRelatedProducts = unstable_cache(
  async (categoryId: string | null, excludeProductId: string): Promise<ProductListItem[]> => {
    if (!categoryId) return []

    const supabase = createPublicSupabaseClient()

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
      .select(
        "id, name, slug, price, compare_at_price, currency, category_id, stock_quantity, product_images(id, storage_path, position)"
      )
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
  },
  ["related-products"],
  { revalidate: 60 }
)

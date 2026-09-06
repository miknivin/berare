import { createServiceRoleClient } from "@berare/db/service-role"
import { getPublicUrl } from "@/lib/s3"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type ProductStatus = "draft" | "active" | "disabled"

export type ProductListItem = {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price: number | null
  status: ProductStatus
  categories: { id: string; name: string } | null
}

export type ProductImage = {
  id: string
  storagePath: string
  publicUrl: string
  position: number
}

export type ProductDetail = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  status: ProductStatus
  category_id: string | null
  images: ProductImage[]
}

export type PaginatedProducts = {
  products: ProductListItem[]
  total: number
  totalPages: number
}

// No RLS scoping needed here — the admin app only ever calls this after
// requireStaff() has already gated the page/action, and uses the
// service-role client deliberately to see every status (draft/disabled
// included), not just what a customer's RLS policy would allow.
export async function getProducts(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedProducts> {
  const supabase = createServiceRoleClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, status, categories(id, name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw error

  const total = count ?? 0
  return {
    products: data as ProductListItem[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getProductsCount(): Promise<number> {
  const supabase = createServiceRoleClient()
  const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true })
  if (error) throw error
  return count ?? 0
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, compare_at_price, status, category_id, product_images(id, storage_path, position)"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const { product_images, ...product } = data
  const images: ProductImage[] = (product_images ?? [])
    .map((img) => ({
      id: img.id,
      storagePath: img.storage_path,
      publicUrl: getPublicUrl(img.storage_path),
      position: img.position,
    }))
    .sort((a, b) => a.position - b.position)

  return { ...product, images } as ProductDetail
}

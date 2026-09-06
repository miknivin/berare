import { createServiceRoleClient } from "@berare/db/service-role"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type ReviewListItem = {
  id: string
  reviewer_name: string
  rating: number
  title: string | null
  body: string
  created_at: string
  products: { id: string; name: string; slug: string } | null
}

export type PaginatedReviews = {
  reviews: ReviewListItem[]
  total: number
  totalPages: number
}

export async function getReviews(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedReviews> {
  const supabase = createServiceRoleClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("product_reviews")
    .select("id, reviewer_name, rating, title, body, created_at, products(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw error

  const total = count ?? 0
  return {
    reviews: data as unknown as ReviewListItem[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

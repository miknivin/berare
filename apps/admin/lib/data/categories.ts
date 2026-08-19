import { createServiceRoleClient } from "@berare/db/service-role"
import { getPublicUrl } from "@/lib/s3"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_path: string | null
}

export type CategoryListItem = Category & {
  parent_name: string | null
  product_count: number
  image_url: string | null
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, image_path")
    .order("name")
  if (error) throw error
  return data ?? []
}

export type PaginatedCategories = {
  categories: CategoryListItem[]
  total: number
  totalPages: number
}

export async function getCategoriesWithMeta(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedCategories> {
  const supabase = createServiceRoleClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Parent names and product counts need the full table regardless of
  // which page is being viewed — a parent or a product's category might
  // not be on the current page — so those two lookups stay unpaginated
  // while only the categories themselves are sliced with .range().
  const [
    { data: pageCategories, error, count },
    { data: allCategories, error: allError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, image_path", { count: "exact" })
      .order("name")
      .range(from, to),
    supabase.from("categories").select("id, name"),
    supabase.from("products").select("category_id").not("category_id", "is", null),
  ])

  if (error) throw error
  if (allError) throw allError
  if (productsError) throw productsError

  const countByCategory = new Map<string, number>()
  for (const { category_id } of products ?? []) {
    if (!category_id) continue
    countByCategory.set(category_id, (countByCategory.get(category_id) ?? 0) + 1)
  }

  const nameById = new Map((allCategories ?? []).map((c) => [c.id, c.name]))
  const total = count ?? 0

  const categories = (pageCategories ?? []).map((category) => ({
    ...category,
    parent_name: category.parent_id ? (nameById.get(category.parent_id) ?? null) : null,
    product_count: countByCategory.get(category.id) ?? 0,
    image_url: category.image_path ? getPublicUrl(category.image_path) : null,
  }))

  return { categories, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

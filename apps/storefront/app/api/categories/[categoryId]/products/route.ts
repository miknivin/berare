import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@berare/db/server"
import { getCategories, getDescendantCategories } from "@/lib/data/categories"

const DROPDOWN_PRODUCT_LIMIT = 8

// Deliberately minimal — the nav dropdown only ever needs a name to
// display and a slug to link to /products/[slug], nothing else. Each
// category's dropdown calls this independently, on demand (first hover),
// not upfront for every category in the nav.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params

  // Same rollup as the /categories/[slug] page — a parent category's
  // dropdown includes products filed under its subcategories, not just
  // products with this exact category_id.
  const categories = await getCategories()
  const categoryIds = [categoryId, ...getDescendantCategories(categories, categoryId).map((c) => c.id)]

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug")
    .in("category_id", categoryIds)
    .eq("status", "active")
    .order("name")
    .limit(DROPDOWN_PRODUCT_LIMIT)

  if (error) {
    return NextResponse.json({ error: "Could not load products" }, { status: 500 })
  }

  return NextResponse.json({ products: data ?? [] })
}

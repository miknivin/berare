import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@berare/db/server"

const SEARCH_RESULT_LIMIT = 6

// Deliberately minimal — the autocomplete dropdown only ever needs a name,
// slug, price, and one thumbnail per product, not the full product-list
// shape used elsewhere.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (!query) {
    return NextResponse.json({ products: [] })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, product_images(storage_path, position)")
    .eq("status", "active")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(SEARCH_RESULT_LIMIT)

  if (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }

  const products = (data ?? []).map((product) => {
    const primaryImage = [...product.product_images].sort((a, b) => a.position - b.position)[0]
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imagePath: primaryImage?.storage_path ?? null,
    }
  })

  return NextResponse.json({ products })
}

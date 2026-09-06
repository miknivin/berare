import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@berare/db/server"

export type ValidatedProduct = {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
}

// Called once on app load (see cart-validator.tsx) to reconcile whatever
// is sitting in localStorage against the real database — a product may
// have been repriced, renamed, or discontinued since it was added.
// Deliberately returns only what's still true; anything requested that
// isn't in the response (deleted, or status != 'active' — RLS already
// restricts the query to that) tells the client to drop it from the cart.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const productIds = Array.isArray(body?.productIds)
    ? body.productIds.filter((id: unknown): id is string => typeof id === "string")
    : []

  if (productIds.length === 0) {
    return NextResponse.json({ products: [] satisfies ValidatedProduct[] })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, product_images(storage_path, position)")
    .in("id", productIds)

  if (error) {
    return NextResponse.json({ error: "Could not validate cart" }, { status: 500 })
  }

  const products: ValidatedProduct[] = (data ?? []).map((product) => {
    const primaryImage = [...product.product_images].sort((a, b) => a.position - b.position)[0]
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primaryImage?.storage_path ?? null,
    }
  })

  return NextResponse.json({ products })
}

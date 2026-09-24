import "server-only"

// Mirrors apps/storefront/lib/cache-tags.ts — kept as a separate literal
// type rather than a shared import since admin and storefront don't share
// a lib package, and the two apps' tag vocabularies aren't guaranteed to
// stay identical forever.
export type StorefrontCacheTag = "categories" | "products" | "banners" | "pricing-config"

// Calls the storefront's POST /api/revalidate after a mutation here changes
// data it caches — revalidateTag() only affects the Next.js process it
// runs in, and admin/storefront are separate deployments, so this is the
// only way to bust that cache from here. Best-effort: a mutation must
// never fail because the storefront was briefly unreachable — the
// storefront's own 60s revalidate window is the fallback if this is ever
// missed.
export async function revalidateStorefront(tag: StorefrontCacheTag): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!baseUrl || !secret) {
    console.error(`revalidateStorefront("${tag}"): missing NEXT_PUBLIC_STOREFRONT_URL or REVALIDATE_SECRET`)
    return
  }

  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tag }),
    })
    if (!res.ok) {
      console.error(`revalidateStorefront("${tag}"): storefront responded ${res.status}`)
    }
  } catch (error) {
    console.error(`revalidateStorefront("${tag}"): request failed`, error)
  }
}

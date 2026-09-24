// Shared vocabulary for `unstable_cache` tags and the /api/revalidate
// endpoint other apps (admin) call into. Kept as a fixed allowlist rather
// than accepting arbitrary strings, so a typo'd tag from another app fails
// loudly instead of silently invalidating nothing.
export const CACHE_TAGS = {
  categories: "categories",
  products: "products",
  banners: "banners",
  pricingConfig: "pricing-config",
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

export function isCacheTag(value: string): value is CacheTag {
  return (Object.values(CACHE_TAGS) as string[]).includes(value)
}

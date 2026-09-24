import "server-only"
import { unstable_cache } from "next/cache"
import { createServiceRoleClient } from "@berare/db/service-role"
import type { PricingConfig } from "@/lib/pricing"
import { CACHE_TAGS } from "@/lib/cache-tags"

// app_config has no client-facing read policy at all (see migration 0003)
// — deliberately, since it also holds affiliate-program values. This is
// the one narrow, server-only read of it from the storefront (checkout
// page for a live preview, and the order route for the authoritative
// calculation) rather than exposing the whole table.
const KEYS = ["prepaid_discount_percent", "cod_free_shipping_threshold", "cod_additional_charge"] as const

// AnnouncementBar calls this on literally every page via the root layout —
// same leverage case as categories, so it gets the same 60s cache. Already
// on the service-role client (no cookies() involved), so no change needed
// there to make it unstable_cache-eligible.
export const getPricingConfig = unstable_cache(
  async (): Promise<PricingConfig> => {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.from("app_config").select("key, value").in("key", KEYS)
    if (error) throw error

    const byKey = new Map((data ?? []).map((row) => [row.key, row.value]))
    return {
      prepaidDiscountPercent: Number(byKey.get("prepaid_discount_percent") ?? 0),
      codFreeShippingThreshold: Number(byKey.get("cod_free_shipping_threshold") ?? 0),
      codAdditionalCharge: Number(byKey.get("cod_additional_charge") ?? 0),
    }
  },
  ["pricing-config"],
  { revalidate: 60, tags: [CACHE_TAGS.pricingConfig] }
)

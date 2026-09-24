import { unstable_cache } from "next/cache"
import { createPublicSupabaseClient } from "@berare/db/public"
import { getS3Url } from "@/lib/image"
import { CACHE_TAGS } from "@/lib/cache-tags"

export type HeroBanner = {
  id: string
  imageUrl: string
  linkUrl: string | null
  altText: string
  title: string
  description: string | null
  ctaLabel: string | null
}

export const getHeroBanners = unstable_cache(
  async (): Promise<HeroBanner[]> => {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from("hero_banners")
      .select("id, image_path, link_url, alt_text, title, description, cta_label")
      .order("position", { ascending: true })

    if (error) throw error

    return (data ?? []).map((banner) => ({
      id: banner.id,
      imageUrl: getS3Url(banner.image_path),
      linkUrl: banner.link_url,
      altText: banner.alt_text,
      title: banner.title,
      description: banner.description,
      ctaLabel: banner.cta_label,
    }))
  },
  ["hero-banners"],
  { revalidate: 60, tags: [CACHE_TAGS.banners] }
)

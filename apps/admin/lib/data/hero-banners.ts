import { createServiceRoleClient } from "@berare/db/service-role"
import { getPublicUrl } from "@/lib/s3"

export type HeroBanner = {
  id: string
  imagePath: string
  publicUrl: string
  linkUrl: string | null
  altText: string
  position: number
  isActive: boolean
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("hero_banners")
    .select("id, image_path, link_url, alt_text, position, is_active")
    .order("position", { ascending: true })

  if (error) throw error

  return (data ?? []).map((banner) => ({
    id: banner.id,
    imagePath: banner.image_path,
    publicUrl: getPublicUrl(banner.image_path),
    linkUrl: banner.link_url,
    altText: banner.alt_text,
    position: banner.position,
    isActive: banner.is_active,
  }))
}

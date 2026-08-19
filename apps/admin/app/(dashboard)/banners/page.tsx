import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getHeroBanners } from "@/lib/data/hero-banners"
import { BannerManager } from "@/components/banners/banner-manager"

export const metadata: Metadata = { title: "Hero Banners" }

export default async function BannersPage() {
  await requireStaff()
  const banners = await getHeroBanners()

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Hero Banners</h1>
        <p className="text-sm text-muted-foreground">
          Shown as a swiper at the top of the storefront homepage. Recommended size: 1920×800px, under ~500KB.
        </p>
      </div>
      <BannerManager banners={banners} />
    </div>
  )
}

import type { Metadata } from "next"
import Image from "next/image"
import { Pencil } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getHeroBanners } from "@/lib/data/hero-banners"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BannerDialog } from "@/components/banners/banner-dialog"
import { BannerDeleteButton } from "@/components/banners/banner-delete-button"
import { BannerActiveToggle } from "@/components/banners/banner-active-toggle"

export const metadata: Metadata = { title: "Hero Banners" }

export default async function BannersPage() {
  await requireStaff()
  const banners = await getHeroBanners()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Hero Banners</h1>
          <p className="text-sm text-muted-foreground">
            Shown as a 2-column swiper at the top of the storefront homepage.
          </p>
        </div>
        <BannerDialog trigger={<Button type="button">New Banner</Button>} />
      </div>

      {banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No banners yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Mockup</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>CTA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <div className="relative w-11 h-11 rounded-md overflow-hidden bg-muted">
                    <Image src={banner.publicUrl} alt="" fill unoptimized className="object-contain" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{banner.title}</TableCell>
                <TableCell className="text-muted-foreground">{banner.ctaLabel ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={banner.isActive ? "default" : "secondary"}>
                    {banner.isActive ? "Visible" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <BannerActiveToggle id={banner.id} isActive={banner.isActive} />
                    <BannerDialog
                      banner={banner}
                      tooltipLabel="Edit"
                      trigger={
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit">
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      }
                    />
                    <BannerDeleteButton id={banner.id} title={banner.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

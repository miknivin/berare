"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Ban, CheckCircle2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconTooltipButton } from "@/components/shared/icon-tooltip-button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { toast } from "@/components/ui/toast"
import {
  getBannerUploadUrl,
  addBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
} from "@/app/(dashboard)/banners/actions"
import type { HeroBanner } from "@/lib/data/hero-banners"

export function BannerManager({ banners }: { banners: HeroBanner[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setIsUploading(true)

    try {
      const urlResult = await getBannerUploadUrl(file.name, file.type)
      if (!urlResult.success) {
        toast.error("Could not upload banner", urlResult.error)
        return
      }

      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadResponse.ok) {
        toast.error("Upload to storage failed", "Please try again.")
        return
      }

      const saveResult = await addBanner(urlResult.key)
      if (!saveResult.success) {
        toast.error("Could not save banner", saveResult.error)
        return
      }

      toast.success("Banner uploaded")
      router.refresh()
    } catch {
      toast.error("Something went wrong uploading the image.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <Upload className="w-4 h-4" aria-hidden="true" />
          {isUploading ? "Uploading…" : "Upload Banner"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        {banners.length === 0 && (
          <p className="text-sm text-muted-foreground">No banners yet. Upload one above.</p>
        )}
        {banners.map((banner) => (
          <BannerRow key={banner.id} banner={banner} />
        ))}
      </div>
    </div>
  )
}

function BannerRow({ banner }: { banner: HeroBanner }) {
  const router = useRouter()
  const [linkUrl, setLinkUrl] = useState(banner.linkUrl ?? "")
  const [altText, setAltText] = useState(banner.altText)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateBanner(banner.id, { linkUrl, altText })
      if (!result.success) {
        toast.error("Could not save banner", result.error)
        return
      }
      toast.success("Banner saved")
      router.refresh()
    })
  }

  function handleToggleActive() {
    startTransition(async () => {
      const result = await toggleBannerActive(banner.id, !banner.isActive)
      if (!result.success) {
        toast.error("Could not update banner", result.error)
        return
      }
      router.refresh()
    })
  }

  async function handleDelete() {
    const result = await deleteBanner(banner.id)
    if (!result.success) {
      toast.error("Could not delete banner", result.error)
      return
    }
    toast.success("Banner deleted")
    router.refresh()
  }

  return (
    <div className="flex gap-4 border border-border rounded-lg p-4">
      <div className="relative w-40 aspect-4/3 shrink-0 rounded-md overflow-hidden bg-muted">
        <Image src={banner.publicUrl} alt="" fill className="object-cover" sizes="160px" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`link-${banner.id}`}>Link (optional)</Label>
            <Input
              id={`link-${banner.id}`}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/categories/skincare"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`alt-${banner.id}`}>Alt text</Label>
            <Input
              id={`alt-${banner.id}`}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the banner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
            Save
          </Button>
          <IconTooltipButton
            label={banner.isActive ? "Disable" : "Enable"}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleActive}
                disabled={isPending}
                aria-label={banner.isActive ? "Disable" : "Enable"}
              />
            }
          >
            {banner.isActive ? (
              <Ban className="w-4 h-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            )}
          </IconTooltipButton>
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete"
                disabled={isPending}
                className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            }
            tooltipLabel="Delete"
            title="Delete banner?"
            description="This banner will be permanently removed from the storefront."
            confirmLabel="Delete"
            onConfirm={handleDelete}
          />
        </div>

        {!banner.isActive && (
          <p className="text-xs text-muted-foreground">Disabled — hidden from the storefront.</p>
        )}
      </div>
    </div>
  )
}

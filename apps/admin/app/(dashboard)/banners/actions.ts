"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"
import { createPresignedUploadUrl, deleteS3Object } from "@/lib/s3"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export type BannerActionResult = { success: true } | { success: false; error: string }

type UploadUrlResult =
  | { success: true; uploadUrl: string; key: string }
  | { success: false; error: string }

export async function getBannerUploadUrl(fileName: string, contentType: string): Promise<UploadUrlResult> {
  await requireStaff()

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." }
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-")
  const key = `banners/${crypto.randomUUID()}-${safeName}`
  const uploadUrl = await createPresignedUploadUrl(key, contentType)

  return { success: true, uploadUrl, key }
}

export async function addBanner(imagePath: string): Promise<BannerActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: existing } = await supabase
    .from("hero_banners")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = (existing?.[0]?.position ?? -1) + 1

  const { error } = await supabase
    .from("hero_banners")
    .insert({ image_path: imagePath, position: nextPosition, alt_text: "" })

  if (error) return { success: false, error: "Could not save banner." }

  revalidatePath("/banners")
  return { success: true }
}

const bannerUpdateSchema = z.object({
  linkUrl: z.string().optional(),
  altText: z.string(),
})

export async function updateBanner(
  id: string,
  input: z.infer<typeof bannerUpdateSchema>
): Promise<BannerActionResult> {
  await requireStaff()

  const parsed = bannerUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("hero_banners")
    .update({ link_url: parsed.data.linkUrl || null, alt_text: parsed.data.altText })
    .eq("id", id)

  if (error) return { success: false, error: "Could not update banner." }

  revalidatePath("/banners")
  return { success: true }
}

export async function toggleBannerActive(id: string, isActive: boolean): Promise<BannerActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("hero_banners").update({ is_active: isActive }).eq("id", id)

  if (error) return { success: false, error: "Could not update banner." }

  revalidatePath("/banners")
  return { success: true }
}

export async function deleteBanner(id: string): Promise<BannerActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: banner } = await supabase
    .from("hero_banners")
    .select("image_path")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("hero_banners").delete().eq("id", id)
  if (error) return { success: false, error: "Could not delete banner." }

  if (banner) {
    await deleteS3Object(banner.image_path).catch((err) =>
      console.error("Failed to delete S3 object", banner.image_path, err)
    )
  }

  revalidatePath("/banners")
  return { success: true }
}

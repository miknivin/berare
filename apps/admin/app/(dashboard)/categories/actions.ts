"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"
import { slugify } from "@/lib/slugify"
import { createPresignedUploadUrl, deleteS3Object } from "@/lib/s3"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const categoryInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().uuid().nullable(),
  imagePath: z.string().nullable(),
})

export type CategoryActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

type UploadUrlResult =
  | { success: true; uploadUrl: string; key: string }
  | { success: false; error: string }

export async function getCategoryImageUploadUrl(
  fileName: string,
  contentType: string
): Promise<UploadUrlResult> {
  await requireStaff()

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." }
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-")
  const key = `categories/${crypto.randomUUID()}-${safeName}`
  const uploadUrl = await createPresignedUploadUrl(key, contentType)

  return { success: true, uploadUrl, key }
}

export async function createCategory(input: z.infer<typeof categoryInputSchema>): Promise<CategoryActionResult> {
  await requireStaff()

  const parsed = categoryInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      parent_id: parsed.data.parentId,
      image_path: parsed.data.imagePath,
    })
    .select("id")
    .single()

  if (error) {
    return {
      success: false,
      error: error.code === "23505" ? "A category with this name already exists." : "Could not create category.",
    }
  }

  revalidatePath("/categories")
  return { success: true, id: data.id }
}

export async function updateCategory(
  id: string,
  input: z.infer<typeof categoryInputSchema>
): Promise<CategoryActionResult> {
  await requireStaff()

  const parsed = categoryInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  if (parsed.data.parentId === id) {
    return { success: false, error: "A category cannot be its own parent." }
  }

  const supabase = createServiceRoleClient()
  const { data: existing } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      parent_id: parsed.data.parentId,
      image_path: parsed.data.imagePath,
    })
    .eq("id", id)

  if (error) {
    return {
      success: false,
      error: error.code === "23505" ? "A category with this name already exists." : "Could not update category.",
    }
  }

  if (existing?.image_path && existing.image_path !== parsed.data.imagePath) {
    // Best-effort — the DB row is already updated either way, so a
    // dangling S3 object here is a minor cleanup issue, never worth
    // failing the user-facing save over.
    await deleteS3Object(existing.image_path).catch((err) =>
      console.error("Failed to delete S3 object", existing.image_path, err)
    )
  }

  revalidatePath("/categories")
  return { success: true, id }
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: existing } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    return { success: false, error: "Could not delete category." }
  }

  if (existing?.image_path) {
    await deleteS3Object(existing.image_path).catch((err) =>
      console.error("Failed to delete S3 object", existing.image_path, err)
    )
  }

  revalidatePath("/categories")
  return { success: true, id }
}

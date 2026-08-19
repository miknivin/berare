"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"
import { slugify } from "@/lib/slugify"
import { createPresignedUploadUrl, deleteS3Object } from "@/lib/s3"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const productInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  status: z.enum(["draft", "active", "disabled"]),
  categoryId: z.string().uuid().nullable(),
})

export type ProductActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createProduct(input: z.infer<typeof productInputSchema>): Promise<ProductActionResult> {
  await requireStaff()

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      description: parsed.data.description || null,
      price: parsed.data.price,
      status: parsed.data.status,
      category_id: parsed.data.categoryId,
    })
    .select("id")
    .single()

  if (error) {
    return {
      success: false,
      error: error.code === "23505" ? "A product with this name already exists." : "Could not create product.",
    }
  }

  revalidatePath("/products")
  return { success: true, id: data.id }
}

export async function updateProduct(
  id: string,
  input: z.infer<typeof productInputSchema>
): Promise<ProductActionResult> {
  await requireStaff()

  const parsed = productInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      status: parsed.data.status,
      category_id: parsed.data.categoryId,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: "Could not update product." }
  }

  revalidatePath("/products")
  revalidatePath(`/products/${id}`)
  return { success: true, id }
}

export async function toggleProductStatus(id: string, status: "active" | "disabled"): Promise<ProductActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("products").update({ status }).eq("id", id)

  if (error) {
    return { success: false, error: "Could not update product status." }
  }

  revalidatePath("/products")
  return { success: true, id }
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: images } = await supabase.from("product_images").select("storage_path").eq("product_id", id)

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    // order_items.product_id has no ON DELETE clause — a product that's
    // been ordered can't be hard-deleted without destroying order history,
    // so it must be disabled instead.
    return {
      success: false,
      error:
        error.code === "23503"
          ? "This product has order history and can't be deleted. Disable it instead."
          : "Could not delete product.",
    }
  }

  // Best-effort — the DB rows are already gone (product_images cascades),
  // so dangling S3 objects here are a minor cleanup issue, never worth
  // failing the user-facing delete over.
  await Promise.all(
    (images ?? []).map((img) =>
      deleteS3Object(img.storage_path).catch((err) =>
        console.error("Failed to delete S3 object", img.storage_path, err)
      )
    )
  )

  revalidatePath("/products")
  return { success: true, id }
}

type UploadUrlResult =
  | { success: true; uploadUrl: string; key: string }
  | { success: false; error: string }

export async function getProductImageUploadUrl(
  productId: string,
  fileName: string,
  contentType: string
): Promise<UploadUrlResult> {
  await requireStaff()

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." }
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-")
  const key = `products/${productId}/${crypto.randomUUID()}-${safeName}`
  const uploadUrl = await createPresignedUploadUrl(key, contentType)

  return { success: true, uploadUrl, key }
}

export async function addProductImage(productId: string, key: string): Promise<ProductActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: existing } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = (existing?.[0]?.position ?? -1) + 1

  const { error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, storage_path: key, position: nextPosition })

  if (error) {
    return { success: false, error: "Could not save image." }
  }

  revalidatePath(`/products/${productId}`)
  return { success: true, id: productId }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ProductActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle()

  const { error } = await supabase.from("product_images").delete().eq("id", imageId)
  if (error) {
    return { success: false, error: "Could not delete image." }
  }

  if (image) {
    // Best-effort — the DB row is already gone either way, so a dangling
    // S3 object here is a minor cleanup issue, never worth failing the
    // user-facing delete over.
    await deleteS3Object(image.storage_path).catch((err) =>
      console.error("Failed to delete S3 object", image.storage_path, err)
    )
  }

  revalidatePath(`/products/${productId}`)
  return { success: true, id: productId }
}

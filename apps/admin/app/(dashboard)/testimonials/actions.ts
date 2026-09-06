"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"

const testimonialInputSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1, "Testimonial text is required"),
  displayOrder: z.number().int(),
})

export type TestimonialActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createTestimonial(
  input: z.infer<typeof testimonialInputSchema>
): Promise<TestimonialActionResult> {
  await requireStaff()

  const parsed = testimonialInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      customer_name: parsed.data.customerName,
      rating: parsed.data.rating,
      body: parsed.data.body,
      display_order: parsed.data.displayOrder,
    })
    .select("id")
    .single()

  if (error) {
    return { success: false, error: "Could not create testimonial." }
  }

  revalidatePath("/testimonials")
  return { success: true, id: data.id }
}

export async function updateTestimonial(
  id: string,
  input: z.infer<typeof testimonialInputSchema>
): Promise<TestimonialActionResult> {
  await requireStaff()

  const parsed = testimonialInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("testimonials")
    .update({
      customer_name: parsed.data.customerName,
      rating: parsed.data.rating,
      body: parsed.data.body,
      display_order: parsed.data.displayOrder,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: "Could not update testimonial." }
  }

  revalidatePath("/testimonials")
  return { success: true, id }
}

export async function toggleTestimonialActive(id: string, isActive: boolean): Promise<TestimonialActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("testimonials").update({ is_active: isActive }).eq("id", id)

  if (error) {
    return { success: false, error: "Could not update testimonial." }
  }

  revalidatePath("/testimonials")
  return { success: true, id }
}

export async function deleteTestimonial(id: string): Promise<TestimonialActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("testimonials").delete().eq("id", id)

  if (error) {
    return { success: false, error: "Could not delete testimonial." }
  }

  revalidatePath("/testimonials")
  return { success: true, id }
}

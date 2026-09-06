import { createServiceRoleClient } from "@berare/db/service-role"

export type Testimonial = {
  id: string
  customer_name: string
  rating: number
  body: string
  is_active: boolean
  display_order: number
  created_at: string
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, customer_name, rating, body, is_active, display_order, created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

import { getTestimonials } from "@/lib/data/reviews"
import { TestimonialsSwiper } from "./testimonials-swiper"

export async function TestimonialsSection({ title = "What Our Customers Say" }: { title?: string }) {
  const testimonials = await getTestimonials()
  if (testimonials.length === 0) return null

  return (
    <section>
      <h2 className="font-heading text-2xl mb-6">{title}</h2>
      <TestimonialsSwiper testimonials={testimonials} />
    </section>
  )
}

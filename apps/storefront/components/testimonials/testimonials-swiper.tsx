"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Grid, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/grid"
import "swiper/css/pagination"
import "./testimonials-swiper.css"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
import type { Testimonial } from "@/lib/data/reviews"

// Grid module turns each "page" of the swiper into an actual rows x
// columns grid (fill: "row" so items read left-to-right, top-to-bottom,
// not column-by-column) — 2x2 on desktop, collapsing down responsively
// on smaller screens instead of just shrinking the same 2x2 layout.
export function TestimonialsSwiper({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Swiper
      className="testimonials-swiper"
      modules={[Grid, Pagination]}
      pagination={{ clickable: true }}
      spaceBetween={24}
      slidesPerView={1}
      grid={{ rows: 1, fill: "row" }}
      breakpoints={{
        640: { slidesPerView: 2, grid: { rows: 1, fill: "row" } },
        1024: { slidesPerView: 2, grid: { rows: 2, fill: "row" } },
      }}
    >
      {testimonials.map((testimonial) => (
        <SwiperSlide key={testimonial.id} className="h-auto">
          <div className="h-full rounded-xl border border-border p-5">
            <StarRatingDisplay rating={testimonial.rating} />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              &ldquo;{testimonial.body}&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium">{testimonial.customer_name}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import "./hero-swiper.css"
import type { HeroBanner } from "@/lib/data/hero-banners"

const AUTOPLAY_MS = 3000
const AUTOPLAY_CONFIG = { delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: false }

// Content is static and identical for every visitor — only the product
// mockups cycle — so the swiper is scoped to just the image column. Text
// needs no per-slide logic or animation since it never changes.
export function HeroSwiper({ banners }: { banners: HeroBanner[] }) {
  return (
    <div className="bg-muted relative overflow-hidden">
      {/* Bubble illustration, purpose-made for this: clusters at the left
          and right edges, plain/transparent through the middle where the
          text and product mockup actually sit. Fills the whole section,
          sits behind everything (z-0), purely decorative. */}
      <Image
        src="/banners/banner-bg.webp"
        alt=""
        fill
        priority
        className="object-cover pointer-events-none select-none z-0 hero-bg-float"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl grid md:grid-cols-2 gap-8 md:gap-16 items-center px-6 md:px-12 py-16 md:py-28 min-h-130 md:min-h-160">
        <div className="order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 md:gap-5">
          <h1 className="font-heading font-bold text-3xl md:text-5xl leading-tight">
            Science-Backed Beauty, <span className="text-primary">For Everyone</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md">
            Explore our full range of skincare and beauty essentials, formulated for real results and delivered
            across India.
          </p>
          <Link
            href="/products"
            className="min-h-11 inline-flex items-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Shop All Products
          </Link>
        </div>

        {banners.length > 0 && (
          <div className="order-1 md:order-2">
            <div className="hero-banner__mockup-frame relative w-full aspect-square max-w-72 md:max-w-lg mx-auto overflow-hidden">
              <Swiper
                className="hero-swiper w-full h-full"
                modules={[Autoplay]}
                direction="vertical"
                autoplay={banners.length > 1 ? AUTOPLAY_CONFIG : false}
                loop={banners.length > 1}
                spaceBetween={40}
                speed={700}
              >
                {banners.map((banner, index) => (
                  <SwiperSlide key={banner.id}>
                    <div className="hero-banner__mockup-image relative w-full h-full">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.altText}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? undefined : "lazy"}
                        className="object-contain"
                        sizes="(min-width: 768px) 40vw, 80vw"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div
                className="absolute inset-x-0 top-0 h-14 md:h-20 bg-linear-to-b from-muted to-transparent pointer-events-none z-10"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-14 md:h-20 bg-linear-to-t from-muted to-transparent pointer-events-none z-10"
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

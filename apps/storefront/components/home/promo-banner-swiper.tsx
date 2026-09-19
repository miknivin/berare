"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "./promo-banner-swiper.css"
import { EnquiryModal } from "@/components/enquiry/enquiry-modal"

const AUTOPLAY_CONFIG = { delay: 4500, disableOnInteraction: false }

type PromoBannerSwiperProps = {
  images: string[]
  href?: string
  linkLabel?: string
  /**
   * When set, clicking a slide opens the enquiry form (tagged with this
   * source) instead of navigating via `href` — the two are mutually
   * exclusive per instance.
   */
  enquirySource?: string
}

// Generic full-width promo banner carousel for the static images placed in
// public/banners/<stage> — used for both the pre-"Shop by Category" and
// post-"New Arrivals" banner slots on the homepage.
export function PromoBannerSwiper({ images, href, linkLabel, enquirySource }: PromoBannerSwiperProps) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  if (images.length === 0) return null

  return (
    <>
      <Swiper
        className="promo-banner-swiper"
        modules={[Autoplay, Pagination]}
        autoplay={images.length > 1 ? AUTOPLAY_CONFIG : false}
        loop={images.length > 1}
        pagination={images.length > 1 ? { clickable: true } : false}
      >
        {images.map((src, index) => (
          <SwiperSlide key={src}>
            <BannerSlide
              src={src}
              href={href}
              linkLabel={linkLabel}
              priority={index === 0}
              onEnquire={enquirySource ? () => setEnquiryOpen(true) : undefined}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {enquirySource && (
        <EnquiryModal
          open={enquiryOpen}
          onClose={() => setEnquiryOpen(false)}
          source={enquirySource}
          heading="Enquire About This Offer"
          subtitle="Share your details and we'll help you claim it."
        />
      )}
    </>
  )
}

function BannerSlide({
  src,
  href,
  linkLabel,
  priority,
  onEnquire,
}: {
  src: string
  href?: string
  linkLabel?: string
  priority: boolean
  onEnquire?: () => void
}) {
  // Source banners are exactly 2:1 — matching that here (instead of a
  // wider desktop ratio) means object-cover never has to crop the top or
  // bottom of the image away.
  const image = (
    <div className="relative w-full aspect-2/1 rounded-2xl overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="object-cover"
        sizes="100vw"
      />
    </div>
  )

  // Only the image itself is clickable, not the whole slide/swiper — so
  // dragging to swipe or clicking the pagination dots never triggers a
  // navigation (or enquiry popup) by accident.
  if (onEnquire) {
    return (
      <button type="button" onClick={onEnquire} className="block w-full text-left" aria-label={linkLabel}>
        {image}
      </button>
    )
  }

  if (!href) return image

  return (
    <Link href={href} className="block" aria-label={linkLabel}>
      {image}
    </Link>
  )
}

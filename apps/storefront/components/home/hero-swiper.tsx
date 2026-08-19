"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { HeroBanner } from "@/lib/data/hero-banners"

const AUTOPLAY_MS = 5000

export function HeroSwiper({ banners }: { banners: HeroBanner[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" })
  }, [])

  // Autoplay — advances until the user starts interacting (swipe/click
  // updates activeIndex too, so this just keeps chaining off it).
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length
        scrollToIndex(next)
        return next
      })
    }, AUTOPLAY_MS)
    return () => clearInterval(interval)
  }, [banners.length, scrollToIndex])

  // Keeps the dots in sync when the user swipes manually instead of
  // clicking a dot.
  function handleScroll() {
    const el = scrollerRef.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(index)
  }

  if (banners.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, index) => {
          const image = (
            <div className="relative w-full aspect-4/3 sm:aspect-21/9">
              <Image
                src={banner.imageUrl}
                alt={banner.altText}
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )

          return (
            <div key={banner.id} className="w-full shrink-0 snap-start">
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} aria-label={banner.altText}>
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          )
        })}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Banner slides">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setActiveIndex(i)
                scrollToIndex(i)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

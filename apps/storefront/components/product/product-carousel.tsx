"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "./product-card"
import type { ProductListItem } from "@/lib/data/products"

// Small tolerance for sub-pixel scroll positions so the scrim doesn't
// flicker on/off right at the boundary.
const EDGE_THRESHOLD = 4

export function ProductCarousel({ products }: { products: ProductListItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Comparing scrollLeft against scrollWidth breaks under snap-mandatory:
  // the browser only ever settles on a card's snap-start point, and the
  // last card's snap point sits short of scrollWidth - clientWidth (by
  // roughly that card's own trailing width) — so that comparison never
  // reaches "false" and the end scrim lingers forever, permanently
  // shading part of the last card. Checking the actual card elements'
  // positions against the viewport is immune to that.
  function updateScrollState() {
    const el = scrollerRef.current
    if (!el || el.children.length === 0) return
    const containerRect = el.getBoundingClientRect()
    const firstRect = el.children[0].getBoundingClientRect()
    const lastRect = el.children[el.children.length - 1].getBoundingClientRect()
    setCanScrollLeft(firstRect.left < containerRect.left - EDGE_THRESHOLD)
    setCanScrollRight(lastRect.right > containerRect.right + EDGE_THRESHOLD)
  }

  useEffect(() => {
    updateScrollState()
    window.addEventListener("resize", updateScrollState)
    return () => window.removeEventListener("resize", updateScrollState)
  }, [products])

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" })
  }

  if (products.length === 0) return null

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={updateScrollState}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="shrink-0 snap-start w-[45%] sm:w-[30%] lg:w-[23%]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* canScrollLeft/Right is element-position based (see
          updateScrollState) so it actually clears once the peeking card
          is the true last/first one, instead of lingering forever the
          way a scrollWidth check would under snap-mandatory. */}
      {canScrollLeft && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-8 md:w-16 bg-linear-to-r from-background to-transparent"
        />
      )}
      {canScrollRight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 md:w-16 bg-linear-to-l from-background to-transparent"
        />
      )}

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

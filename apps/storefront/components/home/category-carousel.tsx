"use client"

import { useEffect, useRef, useState } from "react"
import { CategoryCard } from "./category-card"
import type { Category } from "@/lib/data/categories"

// Small tolerance for sub-pixel scroll positions so the scrim doesn't
// flicker on/off right at the boundary — same pattern as AccountSidebar.
const EDGE_THRESHOLD = 4

// Below md: one category card at a time, horizontally scrollable with a
// peek of the next card and edge scrims hinting there's more. md and up:
// the regular 4-column grid (rendered by the caller), this component only
// covers the mobile case.
export function CategoryCarousel({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Element-position based, not scrollWidth-based — under snap-mandatory
  // the browser only ever settles on a card's snap-start point, which
  // sits short of scrollWidth - clientWidth by roughly that card's own
  // trailing width, so a scrollWidth comparison never reaches "false"
  // and the end scrim never clears (see product-carousel.tsx).
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
  }, [])

  return (
    <div className="relative md:hidden">
      <div
        ref={scrollerRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <div key={category.id} className="shrink-0 w-[78%] snap-start">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-background to-transparent"
        />
      )}
      {canScrollRight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent"
        />
      )}
    </div>
  )
}

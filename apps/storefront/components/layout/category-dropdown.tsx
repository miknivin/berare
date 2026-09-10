"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { Category } from "@/lib/data/categories"

type DropdownProduct = { id: string; name: string; slug: string }

export function CategoryDropdown({ category, hasProducts }: { category: Category; hasProducts: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<DropdownProduct[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleOpen() {
    setIsOpen(true)
    // Fetched once per category, lazily on first hover — not upfront for
    // every category in the nav, and not refetched on subsequent opens.
    if (products !== null || isLoading) return

    setIsLoading(true)
    fetch(`/api/categories/${category.id}/products`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { products?: DropdownProduct[] } | null) => {
        setProducts(data?.products ?? [])
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false))
  }

  // No products anywhere under this category (itself or its
  // subcategories) — just a plain link, no chevron, no dropdown fetch.
  if (!hasProducts) {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        {category.name}
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={handleOpen} onMouseLeave={() => setIsOpen(false)}>
      <Link
        href={`/categories/${category.slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
      >
        {category.name}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-30"
          >
            <div className="w-56 rounded-xl border border-border bg-white shadow-lg p-2">
              {isLoading ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">Loading…</p>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors truncate"
                  >
                    {product.name}
                  </Link>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">No products yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

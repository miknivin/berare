"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import type { Category } from "@/lib/data/categories"

export function MobileMenu({
  categories,
  userEmail,
}: {
  categories: Category[]
  userEmail: string | null
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return
    setOpen(false)
    router.push(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-11 h-11 -ml-2"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-background flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-heading text-lg">Berare</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-11 h-11 -mr-2"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="p-4 border-b border-border">
              <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </form>

            <nav aria-label="Categories" className="flex-1 p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm font-medium min-h-11"
                  >
                    All Products
                  </Link>
                </li>
                {categories
                  .filter((c) => !c.parent_id)
                  .map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={() => setOpen(false)}
                        className="block py-3 text-sm font-medium min-h-11"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-border">
              {userEmail ? (
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm min-h-11"
                >
                  Signed in as {userEmail}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium min-h-11"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

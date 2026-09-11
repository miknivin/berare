"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import type { Category } from "@/lib/data/categories"
import { ProductSearchAutocomplete } from "./product-search-autocomplete"

export function MobileMenu({
  categories,
  userEmail,
}: {
  categories: Category[]
  userEmail: string | null
}) {
  const [open, setOpen] = useState(false)

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

      {/* Portaled to body — the header this button lives in has
          backdrop-blur, and a backdrop-filter ancestor makes browsers
          treat it as the containing block for `fixed` descendants
          instead of the viewport. Without the portal, this overlay gets
          trapped inside the header's own 64px box: the drawer's header
          row shows, but everything below it renders outside where the
          "fixed full-screen" overlay actually is, invisible in practice. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-background flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Image src="/logo.png" alt="Berare" width={116} height={64} className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-11 h-11 -mr-2"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-4 border-b border-border">
                <ProductSearchAutocomplete onNavigate={() => setOpen(false)} />
              </div>

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
                    href="/account"
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
          </div>,
          document.body
        )}
    </>
  )
}

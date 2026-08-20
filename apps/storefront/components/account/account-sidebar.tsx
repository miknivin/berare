"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, User, LogOut } from "lucide-react"

const NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: User },
]

// Small tolerance for sub-pixel scroll positions so the scrim doesn't
// flicker on/off right at the boundary — same pattern as ProductCarousel.
const EDGE_THRESHOLD = 4

export function AccountSidebar() {
  const pathname = usePathname()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > EDGE_THRESHOLD)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - EDGE_THRESHOLD)
  }

  useEffect(() => {
    updateScrollState()
    window.addEventListener("resize", updateScrollState)
    return () => window.removeEventListener("resize", updateScrollState)
  }, [])

  function isActive(href: string) {
    return href === "/account" ? pathname === "/account" : pathname.startsWith(href)
  }

  return (
    <div className="min-w-0">
      {/* Below md: horizontal scrollable tab bar with edge scrims */}
      <div className="relative md:hidden min-w-0">
        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
          <form action="/auth/signout" method="post" className="shrink-0">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap text-muted-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </form>
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

      {/* md and up: vertical sidebar */}
      <nav aria-label="Account" className="hidden md:block space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-2 mt-2 border-t border-border">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}

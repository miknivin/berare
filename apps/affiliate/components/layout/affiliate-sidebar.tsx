"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Link2, Wallet, LogOut, Menu, X } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/earnings", label: "Earnings", icon: Wallet },
]

export function AffiliateSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Sidebar is fixed/off-canvas on mobile with no way to reach it
          otherwise — this bar is the only mobile entry point into nav. */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-border bg-background">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="w-9 h-9 -ml-1.5 flex items-center justify-center"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <Image src="/logo.png" alt="Berare" width={116} height={64} unoptimized className="h-7 w-auto" />
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-56 shrink-0 h-svh fixed inset-y-0 left-0 z-50 border-r border-border bg-muted/30 flex flex-col overflow-y-auto transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center">
            <Image src="/logo.png" alt="Berare" width={116} height={64} priority unoptimized className="h-8 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="md:hidden w-8 h-8 flex items-center justify-center -mr-1.5"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

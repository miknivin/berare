"use client"

import Image from "next/image"
import { Menu } from "lucide-react"
import { useMobileSidebar } from "./mobile-sidebar-context"

// The only mobile entry point into nav — the sidebar itself is fixed and
// off-canvas below md.
export function MobileTopBar() {
  const { toggle } = useMobileSidebar()

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-border bg-background">
      <button
        type="button"
        onClick={toggle}
        aria-label="Open navigation menu"
        className="w-9 h-9 -ml-1.5 flex items-center justify-center"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>
      <Image src="/logo.png" alt="Berare" width={116} height={64} unoptimized className="h-7 w-auto" />
    </header>
  )
}

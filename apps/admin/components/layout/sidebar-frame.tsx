"use client"

import type { ReactNode } from "react"
import { useMobileSidebar } from "./mobile-sidebar-context"

// Wraps AdminSidebar's server-fetched content with the responsive
// open/closed behavior — off-canvas + backdrop below md, always visible
// at md and up.
export function SidebarFrame({ children }: { children: ReactNode }) {
  const { isOpen, close } = useMobileSidebar()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-56 shrink-0 h-svh fixed inset-y-0 left-0 z-50 border-r border-border bg-muted/30 flex flex-col overflow-y-auto transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </aside>
    </>
  )
}

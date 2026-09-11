"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type MobileSidebarContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(null)

// AdminSidebar fetches staff data server-side, so its open/closed state on
// mobile can't live inside it directly — this context is the bridge
// between the mobile top bar's toggle button and the sidebar frame.
export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MobileSidebarContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((value) => !value),
      }}
    >
      {children}
    </MobileSidebarContext.Provider>
  )
}

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext)
  if (!context) throw new Error("useMobileSidebar must be used within a MobileSidebarProvider")
  return context
}

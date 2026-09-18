"use client"

import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { LoginForm } from "./login-form"
import { useIsMounted } from "@/lib/hooks/use-is-mounted"

export function LoginModal({
  open,
  onClose,
  onSuccess,
  heading,
  subtitle,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  heading?: string
  subtitle?: string
}) {
  // document.body doesn't exist during SSR, and Client Components still
  // render once on the server — callers like CheckoutLoginGate default
  // `open` to true, so without this mount guard createPortal would run
  // during that server pass and crash with "document is not defined".
  const mounted = useIsMounted()

  if (!open || !mounted) return null

  // Portaled to body — UserMenuButton (one of this modal's callers) lives
  // inside the navbar's header, which has backdrop-blur. A backdrop-filter
  // ancestor makes browsers treat it as the containing block for `fixed`
  // descendants instead of the viewport, so without the portal this modal
  // renders trapped inside the header's own small box instead of centered
  // in the full viewport (same root cause as the mobile menu drawer bug).
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <LoginForm onSuccess={onSuccess} heading={heading} subtitle={subtitle} />
        </div>
      </div>
    </div>,
    document.body
  )
}

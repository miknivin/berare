"use client"

import { X } from "lucide-react"
import { LoginForm } from "./login-form"

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
  if (!open) return null

  return (
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
    </div>
  )
}

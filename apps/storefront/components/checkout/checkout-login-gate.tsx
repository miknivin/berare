"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"

export function CheckoutLoginGate() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  function handleSuccess() {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="text-center py-16 border border-border rounded-xl">
        <p className="text-muted-foreground mb-6">Sign in to continue to checkout.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          Sign In
        </button>
      </div>

      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
        heading="Sign in to check out"
        subtitle="You'll need to sign in to complete your order."
      />
    </>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"

export function UserMenuButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (isLoggedIn) {
    return (
      <Link
        href="/account"
        aria-label="Your account"
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
      >
        <User className="w-5 h-5" aria-hidden="true" />
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Sign in"
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
      >
        <User className="w-5 h-5" aria-hidden="true" />
      </button>
      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false)
          router.refresh()
        }}
      />
    </>
  )
}

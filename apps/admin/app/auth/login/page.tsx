import { Suspense } from "react"
import Image from "next/image"
import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in — Berare Admin",
}

export default function LoginPage() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 p-6">
      <Image src="/logo.png" alt="Berare" width={300} height={166} priority className="h-10 w-auto" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}

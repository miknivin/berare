import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}

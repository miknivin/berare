"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@berare/db/browser"
// import { GoogleIcon } from "@/components/icons/google-icon"
import { cn } from "@/lib/utils"

type Step = "request" | "verify"

export function LoginForm({
  onSuccess,
  heading = "Sign in",
  subtitle = "Sign in to check out faster and track your orders.",
}: {
  /** When provided (e.g. rendered inside a modal), called instead of navigating to `next`. */
  onSuccess?: () => void
  heading?: string
  subtitle?: string
} = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
  const oauthError = searchParams.get("error")

  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(oauthError)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function friendlyError(message: string) {
    const lower = message.toLowerCase()
    if (lower.includes("rate limit") || lower.includes("too many")) {
      return "Too many attempts. Please wait a moment and try again."
    }
    if (lower.includes("invalid") || lower.includes("expired") || lower.includes("token")) {
      return "That code is incorrect or has expired. Request a new one."
    }
    return "Something went wrong. Please try again."
  }

  // Google sign-in temporarily disabled — not working, re-enable once fixed.
  // async function handleGoogleSignIn() {
  //   setError(null)
  //   const supabase = createBrowserClient()
  //   const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
  //     },
  //   })
  //   if (oauthErr) {
  //     setError(friendlyError(oauthErr.message))
  //     return
  //   }
  //   if (data?.url) {
  //     window.location.href = data.url
  //   }
  // }

  function handleRequestCode(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createBrowserClient()
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpErr) {
        setError(friendlyError(otpErr.message))
        return
      }
      setStatusMessage(`We sent a 6-digit code to ${email}.`)
      setStep("verify")
    })
  }

  function handleResendCode() {
    setError(null)
    setStatusMessage(null)
    startTransition(async () => {
      const supabase = createBrowserClient()
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpErr) {
        setError(friendlyError(otpErr.message))
        return
      }
      setCode("")
      setStatusMessage(`We sent a new code to ${email}.`)
    })
  }

  function handleVerifyCode(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createBrowserClient()
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      })
      if (verifyErr) {
        setError(friendlyError(verifyErr.message))
        return
      }
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(next)
        router.refresh()
      }
    })
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-heading text-3xl mb-2">{heading}</h1>
      <p className="text-muted-foreground text-sm mb-8">{subtitle}</p>

      {/* Google sign-in temporarily disabled — not working, re-enable once fixed.
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="w-full min-h-11 flex items-center justify-center gap-3 rounded-full border border-border bg-white px-6 py-3 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
      >
        <GoogleIcon className="w-5 h-5" />
        Continue with Google
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      */}

      {step === "request" ? (
        <form onSubmit={handleRequestCode} className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isPending || !email}
            className="w-full min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isPending ? "Sending code…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <label htmlFor="code" className="block text-sm font-medium">
            6-digit code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isPending || code.length !== 6}
            className="w-full min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isPending ? "Verifying…" : "Verify and sign in"}
          </button>
          <div className="flex items-center justify-center gap-3 text-sm">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
            >
              Resend code
            </button>
            <span className="text-border">·</span>
            <button
              type="button"
              onClick={() => {
                setStep("request")
                setCode("")
                setStatusMessage(null)
                setError(null)
              }}
              className="text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      <div aria-live="polite" className="mt-4 text-sm">
        {statusMessage && !error && (
          <p className="text-muted-foreground">{statusMessage}</p>
        )}
        {error && (
          <p className={cn("text-destructive")} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

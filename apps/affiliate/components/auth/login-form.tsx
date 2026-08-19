"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@berare/db/browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GoogleIcon } from "@/components/icons/google-icon"

type Step = "request" | "verify"

export function LoginForm() {
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

  async function handleGoogleSignIn() {
    setError(null)
    const supabase = createBrowserClient()
    const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (oauthErr) {
      setError(friendlyError(oauthErr.message))
      return
    }
    if (data?.url) {
      window.location.href = data.url
    }
  }

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
      router.push(next)
      router.refresh()
    })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Affiliate sign in</CardTitle>
        <CardDescription>Sign in to manage your links and earnings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full h-9"
          onClick={handleGoogleSignIn}
          disabled={isPending}
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full h-9" disabled={isPending || !email}>
              {isPending ? "Sending code…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="text-center tracking-[0.4em]"
              />
            </div>
            <Button type="submit" className="w-full h-9" disabled={isPending || code.length !== 6}>
              {isPending ? "Verifying…" : "Verify and sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-8 text-xs"
              onClick={() => {
                setStep("request")
                setCode("")
                setStatusMessage(null)
                setError(null)
              }}
            >
              Use a different email
            </Button>
          </form>
        )}

        <div aria-live="polite" className="text-sm">
          {statusMessage && !error && (
            <p className="text-muted-foreground">{statusMessage}</p>
          )}
          {error && (
            <p className="text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

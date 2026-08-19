"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@berare/db/browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Step = "request" | "verify"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"

  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
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
    if (lower.includes("signups not allowed") || lower.includes("user not found")) {
      return "That email isn't set up for staff access."
    }
    return "Something went wrong. Please try again."
  }

  function handleRequestCode(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createBrowserClient()
      // Unlike the storefront's self-service OTP, admin sign-in never
      // auto-creates an account — only emails that already exist (i.e.
      // were created for a staff member) can request a code.
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
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
        <CardTitle className="text-xl">Admin sign in</CardTitle>
        <CardDescription>Staff access only.</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="text-center text-lg tracking-[0.5em]"
              />
            </div>
            <Button type="submit" className="w-full h-9" disabled={isPending || code.length !== 6}>
              {isPending ? "Verifying…" : "Verify and sign in"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("request")
                setCode("")
                setStatusMessage(null)
                setError(null)
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Use a different email
            </button>
          </form>
        )}

        <div aria-live="polite" className="mt-3">
          {statusMessage && !error && (
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

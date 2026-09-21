"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitAffiliateApplication } from "@/app/actions"

export function ApplyForm({
  defaultFullName,
  defaultEmail,
  defaultPhone,
}: {
  defaultFullName: string
  defaultEmail: string
  defaultPhone: string
}) {
  const router = useRouter()
  const [fullName, setFullName] = useState(defaultFullName)
  const [email, setEmail] = useState(defaultEmail)
  const [phone, setPhone] = useState(defaultPhone)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await submitAffiliateApplication({ fullName, email, phone, message })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    // The home page reads the new application's status server-side and
    // switches to the "under review" message — no local submitted state
    // needed here.
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm text-left space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Tell us about yourself (optional)</Label>
        <Textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How do you plan to promote Berare? Social media, blog, etc."
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full h-9" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  )
}

"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { submitAffiliateApplication } from "@/app/affiliate-apply/actions"

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
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await submitAffiliateApplication({ fullName, email, phone, message })
    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }
    setSubmitted(true)
    router.refresh()
  }

  if (submitted) {
    return (
      <div className="text-center py-12 border border-border rounded-xl">
        <h2 className="font-heading text-2xl mb-2">Application submitted!</h2>
        <p className="text-muted-foreground text-sm">
          We&apos;ll review your application and get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
          Full name
        </label>
        <input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1.5">
          Tell us about yourself (optional)
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How do you plan to promote Berare? Social media, blog, etc."
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-12 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  )
}

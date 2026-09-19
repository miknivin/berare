"use client"

import { useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { useIsMounted } from "@/lib/hooks/use-is-mounted"

export function EnquiryModal({
  open,
  onClose,
  source,
  heading = "Enquire Now",
  subtitle = "Share your details and we'll get back to you.",
}: {
  open: boolean
  onClose: () => void
  /** Free-text tag identifying where this enquiry came from (shown to staff in admin). */
  source?: string
  heading?: string
  subtitle?: string
}) {
  // Same reason as LoginModal: document.body doesn't exist during SSR,
  // and this could in principle be mounted already-open.
  const mounted = useIsMounted()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!open || !mounted) return null

  function resetAndClose() {
    onClose()
    setName("")
    setPhone("")
    setEmail("")
    setMessage("")
    setError(null)
    setSubmitted(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          email: email || undefined,
          message: message || undefined,
          source,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={heading}>
      <div className="absolute inset-0 bg-black/40" onClick={resetAndClose} aria-hidden="true" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close"
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {submitted ? (
            <div className="text-center py-6">
              <h2 className="font-heading text-xl mb-2">Thank you!</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ve received your enquiry and will get back to you soon.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-xl mb-1">{heading}</h2>
              <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="enquiry-name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    id="enquiry-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="enquiry-phone" className="block text-sm font-medium mb-1">
                    Phone number
                  </label>
                  <input
                    id="enquiry-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional if you add an email below"
                    className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="enquiry-email" className="block text-sm font-medium mb-1">
                    Email <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id="enquiry-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="enquiry-message" className="block text-sm font-medium mb-1">
                    Message <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="enquiry-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
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
                  disabled={isSubmitting || !name || (!phone && !email)}
                  className="w-full min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Sending…" : "Send Enquiry"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

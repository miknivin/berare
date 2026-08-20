"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/app/account/profile/actions"
import type { Profile } from "@/lib/data/profile"

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateProfile({ fullName, phone: phone || undefined })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <span className="block text-sm font-medium mb-1.5">Email</span>
        <p className="w-full min-h-11 flex items-center rounded-lg border border-border bg-muted px-4 text-sm text-muted-foreground">
          {email}
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !fullName}
        className="min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>

      <div aria-live="polite" className="text-sm">
        {saved && !error && <p className="text-green-700">Profile updated.</p>}
        {error && (
          <p className="text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}

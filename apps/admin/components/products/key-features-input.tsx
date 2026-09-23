"use client"

import { useState, type KeyboardEvent } from "react"
import { ArrowRight, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MAX_KEY_FEATURES, MAX_WORDS_PER_KEY_FEATURE } from "@/lib/key-features"

export function KeyFeaturesInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (features: string[]) => void
}) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const atLimit = value.length >= MAX_KEY_FEATURES

  function addFeature() {
    const text = draft.trim()
    if (!text) return

    if (atLimit) {
      setError(`You can add up to ${MAX_KEY_FEATURES} key features.`)
      return
    }
    if (text.split(/\s+/).length > MAX_WORDS_PER_KEY_FEATURE) {
      setError(`Keep each key feature to ${MAX_WORDS_PER_KEY_FEATURE} words or fewer.`)
      return
    }
    if (value.some((f) => f.toLowerCase() === text.toLowerCase())) {
      setError("That key feature is already added.")
      return
    }

    onChange([...value, text])
    setDraft("")
    setError(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder={atLimit ? "Maximum reached" : "e.g. Paraben-free formula"}
          disabled={atLimit}
          maxLength={80}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addFeature}
          disabled={atLimit || !draft.trim()}
          aria-label="Add key feature"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((feature, index) => (
            <li key={`${feature}-${index}`}>
              <Badge variant="secondary" className="gap-1">
                {feature}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove "${feature}"`}
                  className="rounded-full hover:bg-foreground/10"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{MAX_KEY_FEATURES} key features &middot; max {MAX_WORDS_PER_KEY_FEATURE} words each
      </p>
    </div>
  )
}

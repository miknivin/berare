"use client"

import { useState, type KeyboardEvent } from "react"
import { ArrowRight, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Generic chip-list editor — type text, press Enter or the arrow button to
// add it as a dismissable chip. Used for key features, benefits, skin
// types, and key ingredients, each with their own item/word caps.
export function ChipListInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  maxItems,
  maxWordsPerItem,
}: {
  value: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems: number
  maxWordsPerItem?: number
}) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const atLimit = value.length >= maxItems

  function addItem() {
    const text = draft.trim()
    if (!text) return

    if (atLimit) {
      setError(`You can add up to ${maxItems} items.`)
      return
    }
    if (maxWordsPerItem && text.split(/\s+/).length > maxWordsPerItem) {
      setError(`Keep each item to ${maxWordsPerItem} words or fewer.`)
      return
    }
    if (value.some((v) => v.toLowerCase() === text.toLowerCase())) {
      setError("That item is already added.")
      return
    }

    onChange([...value, text])
    setDraft("")
    setError(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
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
          placeholder={atLimit ? "Maximum reached" : placeholder}
          disabled={atLimit}
          maxLength={80}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addItem}
          disabled={atLimit || !draft.trim()}
          aria-label="Add"
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
          {value.map((item, index) => (
            <li key={`${item}-${index}`}>
              <Badge variant="secondary" className="gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove "${item}"`}
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
        {value.length}/{maxItems} items{maxWordsPerItem ? ` · max ${maxWordsPerItem} words each` : ""}
      </p>
    </div>
  )
}

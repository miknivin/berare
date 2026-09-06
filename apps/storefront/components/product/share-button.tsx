"use client"

import { useEffect, useRef, useState } from "react"
import { Share2, MessageCircle, Mail, Copy, Check } from "lucide-react"

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  async function handleShareClick() {
    // Native share sheet (mobile browsers) already lists WhatsApp,
    // Messages, Mail, copy, etc. — nothing more to build there. Desktop
    // browsers mostly lack navigator.share, so they get the popover.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled — not an error worth surfacing.
      }
      return
    }
    setOpen((prev) => !prev)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleShareClick}
        aria-label="Share this product"
        aria-expanded={open}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-muted transition-colors"
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-20 top-full mt-2 right-0 w-56 rounded-xl border border-border bg-white shadow-lg p-1.5 flex flex-col"
        >
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            role="menuitem"
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            Email
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-left"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  )
}

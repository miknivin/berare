"use client"

import type { ReactElement, ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * An icon-only trigger with a hover/focus tooltip. `render` is the actual
 * interactive element (a Button, a Link, or another Base UI trigger like
 * DialogTrigger) — Base UI's render-prop chaining merges the tooltip's
 * listeners onto whatever DOM node that element ultimately becomes.
 */
export function IconTooltipButton({
  label,
  render,
  children,
}: {
  label: string
  render: ReactElement
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={render}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

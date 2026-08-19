"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"

const { createToastManager } = ToastPrimitive
import { CheckCircle2, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const toastManager = createToastManager()

export const toast = {
  success: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "error" }),
  info: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "info" }),
}

const TOAST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((t) => {
    const Icon = TOAST_ICONS[t.type ?? "info"] ?? Info
    return (
      <ToastPrimitive.Root
        key={t.id}
        toast={t}
        className={cn(
          "flex items-start gap-2.5 w-80 rounded-lg bg-popover p-3.5 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10",
          "transition-all duration-200",
          "data-starting-style:opacity-0 data-starting-style:translate-x-4",
          "data-ending-style:opacity-0"
        )}
      >
        <Icon
          className={cn(
            "w-4.5 h-4.5 shrink-0 mt-0.5",
            t.type === "success" && "text-primary",
            t.type === "error" && "text-destructive",
            (t.type === "info" || !t.type) && "text-muted-foreground"
          )}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <ToastPrimitive.Title className="font-medium leading-snug" />
          {t.description && (
            <ToastPrimitive.Description className="text-xs text-muted-foreground mt-0.5" />
          )}
        </div>
        <ToastPrimitive.Close aria-label="Dismiss" className="shrink-0 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" aria-hidden="true" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  })
}

export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-100 flex flex-col-reverse gap-2">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

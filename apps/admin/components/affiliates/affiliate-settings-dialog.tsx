"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AffiliateSettingsForm } from "./affiliate-settings-form"
import type { AffiliateSettings } from "@/lib/data/affiliate-settings"

export function AffiliateSettingsDialog({ settings }: { settings: AffiliateSettings }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSuccess() {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="h-9">
            <Settings className="w-4 h-4" aria-hidden="true" />
            Settings
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affiliate Program Settings</DialogTitle>
          <DialogDescription>Controls how affiliates earn and cash out points.</DialogDescription>
        </DialogHeader>
        <AffiliateSettingsForm settings={settings} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

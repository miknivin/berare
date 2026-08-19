import type { Metadata } from "next"
import { Mail, Phone, MapPin } from "lucide-react"
import { BUSINESS_INFO, formatAddress } from "@/lib/business-info"

export const metadata: Metadata = { title: "Contact Us" }

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-16">
      <h1 className="font-heading text-3xl mb-2">Contact Us</h1>
      <p className="text-sm text-muted-foreground mb-10">
        We&apos;re here to help with orders, products, or anything else.
      </p>

      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium text-sm">{BUSINESS_INFO.legalName}</p>
            <p className="text-sm text-muted-foreground">{formatAddress()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`} className="text-sm hover:text-primary">
            {BUSINESS_INFO.phone}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <a href={`mailto:${BUSINESS_INFO.email}`} className="text-sm hover:text-primary">
            {BUSINESS_INFO.email}
          </a>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Customer support hours: Monday–Saturday, 10:00 AM–6:00 PM IST. We typically respond to emails
            within 1–2 business days.
          </p>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getAffiliateSettings, getPaymentSettings } from "@/lib/data/settings"
import { AffiliateSettingsForm } from "@/components/settings/affiliate-settings-form"
import { PaymentSettingsForm } from "@/components/settings/payment-settings-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  await requireStaff()

  const [affiliateSettings, paymentSettings] = await Promise.all([getAffiliateSettings(), getPaymentSettings()])

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Program</CardTitle>
          </CardHeader>
          <CardContent>
            <AffiliateSettingsForm settings={affiliateSettings} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment & Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentSettingsForm settings={paymentSettings} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

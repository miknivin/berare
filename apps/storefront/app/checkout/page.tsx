import type { Metadata } from "next"
import { createServerSupabaseClient } from "@berare/db/server"
import { getPricingConfig } from "@/lib/data/pricing-config"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { CheckoutLoginGate } from "@/components/checkout/checkout-login-gate"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function CheckoutPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pricingConfig = await getPricingConfig()

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-10">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Checkout</h1>
      {user ? <CheckoutForm userEmail={user.email!} pricingConfig={pricingConfig} /> : <CheckoutLoginGate />}
    </div>
  )
}

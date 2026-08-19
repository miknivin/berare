import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@berare/db/server"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function CheckoutPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/checkout")
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-10">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Checkout</h1>
      <CheckoutForm userEmail={user.email!} />
    </div>
  )
}

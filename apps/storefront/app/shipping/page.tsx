import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { BUSINESS_INFO } from "@/lib/business-info"

export const metadata: Metadata = { title: "Shipping Policy" }

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping Policy" updatedAt="17 August 2026">
      <section>
        <h2>Delivery Locations</h2>
        <p>We currently ship across India to all serviceable pin codes covered by our courier partners.</p>
      </section>

      <section>
        <h2>Processing Time</h2>
        <p>
          Orders are processed and handed over to our courier partner within 1–2 business days of
          confirmation. Orders placed on Sundays or public holidays are processed the next business day.
        </p>
      </section>

      <section>
        <h2>Delivery Time</h2>
        <p>
          Once shipped, orders are typically delivered within 3–7 business days depending on your
          location. Deliveries to remote or non-metro pin codes may take a little longer. You will receive
          a tracking link by email/SMS once your order is dispatched.
        </p>
      </section>

      <section>
        <h2>Shipping Charges</h2>
        <p>
          Shipping charges, if any, are calculated at checkout based on order value and delivery location
          and shown before payment.
        </p>
      </section>

      <section>
        <h2>Order Tracking</h2>
        <p>
          You can track the status of your order from your account under &quot;Track Order&quot;, or using
          the tracking link shared after dispatch.
        </p>
      </section>

      <section>
        <h2>Delays</h2>
        <p>
          While we make every effort to meet the delivery timelines above, delays may occasionally occur
          due to courier network disruptions, weather, or circumstances beyond our control. We will keep
          you informed if your order is significantly delayed.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          For any shipping-related questions, reach us at{" "}
          <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a> or call{" "}
          <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}>{BUSINESS_INFO.phone}</a>.
        </p>
      </section>
    </LegalPage>
  )
}

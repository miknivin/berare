import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { BUSINESS_INFO, formatAddress } from "@/lib/business-info"

export const metadata: Metadata = { title: "Terms of Service" }

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updatedAt="17 August 2026">
      <section>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of this website, operated by{" "}
          {BUSINESS_INFO.legalName} (&quot;{BUSINESS_INFO.brandName}&quot;, &quot;we&quot;, &quot;us&quot;,
          or &quot;our&quot;). By accessing or placing an order on this website, you agree to these Terms.
        </p>
      </section>

      <section>
        <h2>Products & Pricing</h2>
        <p>
          We make every effort to display product details, images, and prices accurately. Prices are
          listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We
          reserve the right to correct pricing or listing errors and to modify or discontinue products at
          any time.
        </p>
      </section>

      <section>
        <h2>Orders & Payment</h2>
        <p>
          By placing an order, you confirm that the delivery details provided are accurate. We accept
          payment via Razorpay (cards, UPI, netbanking, wallets) and Cash on Delivery (COD), where
          available. Orders are confirmed only after successful payment or, for COD orders, once placed.
          We reserve the right to cancel any order in cases of suspected fraud, pricing errors, or
          unavailability of stock, in which case any amount paid will be refunded.
        </p>
      </section>

      <section>
        <h2>Shipping & Delivery</h2>
        <p>
          Please refer to our <a href="/shipping">Shipping Policy</a> for delivery timelines and charges.
        </p>
      </section>

      <section>
        <h2>Cancellations, Returns & Refunds</h2>
        <p>
          Please refer to our <a href="/returns">Cancellation & Refund Policy</a> for details on
          cancelling an order, returning a product, and how refunds are processed.
        </p>
      </section>

      <section>
        <h2>Account Responsibility</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account and for all activity
          under it. Please notify us immediately of any unauthorized use of your account.
        </p>
      </section>

      <section>
        <h2>Affiliate Program</h2>
        <p>
          Participation in our affiliate program is subject to separate approval and additional terms
          communicated at the time of approval, including commission structure and payout conditions.
        </p>
      </section>

      <section>
        <h2>Intellectual Property</h2>
        <p>
          All content on this website, including text, graphics, logos, and images, is the property of{" "}
          {BUSINESS_INFO.legalName} or its licensors and may not be used without permission.
        </p>
      </section>

      <section>
        <h2>Limitation of Liability</h2>
        <p>
          We are not liable for indirect, incidental, or consequential damages arising from your use of
          this website or our products, to the extent permitted by applicable law.
        </p>
      </section>

      <section>
        <h2>Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
          jurisdiction of the courts at Dakshina Kannada, Karnataka.
        </p>
      </section>

      <section>
        <h2>Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the website after changes are
          posted constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          {BUSINESS_INFO.legalName}
          <br />
          {formatAddress()}
          <br />
          Email: <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>
          <br />
          Phone: <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}>{BUSINESS_INFO.phone}</a>
        </p>
      </section>
    </LegalPage>
  )
}

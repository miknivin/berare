import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { BUSINESS_INFO, formatAddress } from "@/lib/business-info"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="17 August 2026">
      <section>
        <p>
          {BUSINESS_INFO.legalName} (&quot;{BUSINESS_INFO.brandName}&quot;, &quot;we&quot;, &quot;us&quot;,
          or &quot;our&quot;) operates this website and is committed to protecting your privacy. This
          Privacy Policy explains what personal information we collect, how we use it, and the choices you
          have.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <ul>
          <li>Contact details: name, email address, phone number, delivery address</li>
          <li>Account information: login details when you sign in via email or Google</li>
          <li>Order information: items purchased, order value, payment method</li>
          <li>
            Payment information: payments are processed directly by Razorpay; we do not store your card,
            UPI, or bank account details on our servers
          </li>
          <li>Usage data: pages visited, device/browser information, and cookies (see below)</li>
          <li>
            Affiliate information (if you apply as an affiliate): name, email, phone, and payout bank
            details for processing commission payouts
          </li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process and deliver your orders</li>
          <li>To communicate order confirmations, shipping updates, and support responses</li>
          <li>To operate your account and order history</li>
          <li>To process affiliate commissions and payouts, where applicable</li>
          <li>To improve our website, products, and customer experience</li>
          <li>To comply with legal and tax obligations</li>
        </ul>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We use essential cookies to keep you signed in and to remember your cart. If you arrive via an
          affiliate link, we also use a cookie to record which affiliate referred your visit, so the
          correct commission can be attributed.
        </p>
      </section>

      <section>
        <h2>Sharing of Information</h2>
        <p>We do not sell your personal information. We share information only with:</p>
        <ul>
          <li>Payment processors (Razorpay) to complete transactions</li>
          <li>Courier and logistics partners to deliver your order</li>
          <li>Service providers who help us operate the website (e.g. hosting, email delivery)</li>
          <li>Authorities, where required by law</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We use industry-standard measures to protect your information, including encrypted connections
          (HTTPS) and access-controlled systems. No online service can guarantee absolute security, but we
          work to protect your data at every stage.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information by
          contacting us at <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>. You can
          also update your account details directly from your profile.
        </p>
      </section>

      <section>
        <h2>Children&apos;s Privacy</h2>
        <p>Our website is not intended for children under 18, and we do not knowingly collect their data.</p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an
          updated revision date.
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

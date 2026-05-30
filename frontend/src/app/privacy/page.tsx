import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Food Villa collects, uses and protects your information."
      effective="May 2026"
      sections={[
        {
          heading: "Information we collect",
          body: (
            <>
              <p>When you use Food Villa we collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Account info</strong> — name, email, role, and (optionally)
                  phone number and avatar URL.
                </li>
                <li>
                  <strong>Order details</strong> — items ordered, prices, delivery
                  address and order history.
                </li>
                <li>
                  <strong>Location</strong> — only when you grant permission for the
                  &quot;Near me&quot; feature; we don&apos;t store your coordinates.
                </li>
                <li>
                  <strong>Payment metadata</strong> — Stripe handles card data
                  directly. We only store the payment method (card/COD) and a
                  reference ID.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>To process and deliver your orders.</li>
              <li>To show your order history and let you re-order.</li>
              <li>To improve the platform (anonymized usage analytics).</li>
              <li>To send order-related notifications (email/socket).</li>
            </ul>
          ),
        },
        {
          heading: "Sharing & third parties",
          body: (
            <p>
              We share order details with the restaurant fulfilling your order
              and with Stripe for payment processing. We never sell your data.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You can update your profile, addresses, and avatar at any time
              from <em>/profile</em>. To delete your account or request a copy
              of your data, email us — we&apos;ll respond within 30 days.
            </p>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              Food Villa uses a single httpOnly cookie for refreshing your
              auth session. We don&apos;t use third-party tracking cookies in
              v1.
            </p>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              Passwords are hashed with bcrypt. Tokens are signed with
              rotating secrets. The database connection is encrypted via TLS.
              Card data is never seen by our servers — Stripe Checkout
              handles it.
            </p>
          ),
        },
      ]}
    />
  );
}

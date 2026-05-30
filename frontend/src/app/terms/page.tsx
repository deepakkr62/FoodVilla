import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="The rules of using Food Villa as a customer or restaurant partner."
      effective="May 2026"
      sections={[
        {
          heading: "Acceptance",
          body: (
            <p>
              By using Food Villa you agree to these terms. If you don&apos;t,
              please don&apos;t use the service.
            </p>
          ),
        },
        {
          heading: "Accounts",
          body: (
            <p>
              You&apos;re responsible for the activity on your account. Don&apos;t
              share your password. Tell us immediately if you suspect
              unauthorized access.
            </p>
          ),
        },
        {
          heading: "Orders & payments",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Prices are set by the restaurant and may change without notice.</li>
              <li>
                You agree to pay the total shown at checkout, including taxes
                and delivery fees.
              </li>
              <li>
                Cancellations follow the restaurant&apos;s discretion before the
                order is &quot;out for delivery&quot;.
              </li>
            </ul>
          ),
        },
        {
          heading: "Restaurant partners",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>You confirm you own or operate the restaurant you list.</li>
              <li>You&apos;re responsible for menu accuracy and food safety.</li>
              <li>
                Food Villa is a marketplace — we&apos;re not the manufacturer of
                any food sold via the platform.
              </li>
            </ul>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              Don&apos;t abuse the API, scrape data en masse, post fake reviews,
              or impersonate others. We&apos;ll suspend accounts that do.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              Food Villa is provided &quot;as is&quot;. To the extent permitted by
              law, our liability is limited to the amount you&apos;ve paid us in
              the last 12 months.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              We may update these terms. Material changes will be communicated
              by email or banner at least 14 days before they take effect.
            </p>
          ),
        },
      ]}
    />
  );
}

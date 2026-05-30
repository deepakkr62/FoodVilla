import type { Metadata } from "next";
import Link from "next/link";
import { Bike, Mail, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a delivery partner",
};

export default function DeliveryPartnerPage() {
  return (
    <div className="container-narrow py-16">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 p-10 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
            <Sparkles size={12} /> Coming Soon
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold">
            Become a delivery partner
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Pick up nearby orders, track earnings, and get paid weekly. The
            delivery partner program is launching in Phase 2.
          </p>
        </div>
        <div className="grid gap-6 p-10 md:grid-cols-3">
          <Feature icon={Bike} title="Flexible hours" body="Work when it suits you — no fixed shifts." />
          <Feature icon={Sparkles} title="Weekly payouts" body="Earnings deposited every Monday, with full transparency." />
          <Feature icon={Mail} title="Get notified" body="Drop your email and we'll let you know when registrations open." />
        </div>
        <div className="border-t border-cream-dark/60 p-8 text-center">
          <a
            href="mailto:deepakkr220399@gmail.com?subject=Delivery partner waitlist"
            className="btn-primary"
          >
            <Mail size={16} /> Join the waitlist
          </a>
          <p className="mt-3 text-xs text-ink-muted">
            <Link href="/" className="hover:underline">
              ← Back home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  body: string;
}) {
  return (
    <div>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={20} />
      </span>
      <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Mail, MessageSquare, Receipt, ShoppingBag, Store } from "lucide-react";
import { HelpChatbot } from "@/components/HelpChatbot";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Get answers, contact support, learn how Food Villa works.",
};

const QUICK_LINKS = [
  { href: "/restaurants", icon: ShoppingBag, label: "Browse restaurants", desc: "Start exploring" },
  { href: "/orders", icon: Receipt, label: "Your orders", desc: "Track or review past orders" },
  { href: "/partner/restaurant", icon: Store, label: "List your restaurant", desc: "Become a partner" },
];

export default function HelpPage() {
  return (
    <div className="container-narrow grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <header className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
            <HelpCircle size={12} /> Help & Support
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Chat with our assistant for instant answers, or email us for
            anything else. We&apos;re a small team and we read every message.
          </p>
        </header>

        <HelpChatbot />
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Mail className="text-brand-500" size={18} /> Email support
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Direct line for refunds, account help, business inquiries.
          </p>
          <a
            href="mailto:deepakkr220399@gmail.com"
            className="btn-primary mt-3 w-full"
          >
            deepakkr220399@gmail.com
          </a>
          <p className="mt-2 text-xs text-ink-muted">
            We aim to reply within 24 hours.
          </p>
        </div>

        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <MessageSquare className="text-brand-500" size={18} /> Quick links
          </h2>
          <ul className="mt-3 space-y-2">
            {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-start gap-3 rounded-xl border border-cream-dark p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon size={14} />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-ink">{label}</div>
                    <div className="text-xs text-ink-muted">{desc}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold">Status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <StatusRow label="Ordering" />
            <StatusRow label="Payments" />
            <StatusRow label="Live tracking" />
            <StatusRow label="Restaurant dashboard" />
          </ul>
        </div>
      </aside>
    </div>
  );
}

function StatusRow({ label }: { label: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Operational
      </span>
    </li>
  );
}

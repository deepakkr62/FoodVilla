import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Percent, Sparkles, Tag, Truck, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Offers",
  description: "Discounts and rewards on Food Villa.",
};

const OFFERS = [
  {
    icon: Sparkles,
    code: "FIRSTORDER",
    title: "Welcome offer",
    sub: "50% OFF on your first order",
    detail: "Auto-applied on cart. Max discount ₹150. Customers only.",
    color: "from-brand-400 to-brand-600",
  },
  {
    icon: Truck,
    code: "FREEDELIVERY",
    title: "Free delivery",
    sub: "Saturdays & Sundays",
    detail: "On orders above ₹299. Applies to all restaurants in your city.",
    color: "from-accent to-accent-dark",
  },
  {
    icon: Percent,
    code: "BIRYANI20",
    title: "Biryani fiesta",
    sub: "20% OFF on biryani orders",
    detail: "Applies on any Biryani-cuisine restaurant. Max ₹100.",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Wallet,
    code: "WALLET10",
    title: "Pay by card, save more",
    sub: "Extra 10% cashback",
    detail: "Pay with a Visa/Mastercard via Stripe. Min order ₹500.",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    icon: Tag,
    code: "WEEKDAYLUNCH",
    title: "Weekday lunch combo",
    sub: "Flat ₹50 OFF on lunch (12–3 PM)",
    detail: "Mon–Fri, on orders above ₹250.",
    color: "from-rose-500 to-rose-700",
  },
];

export default function OffersPage() {
  return (
    <div className="container-narrow py-10">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
          <Gift size={12} /> Offers
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Deals you&apos;ll love
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          A growing list of promotions and cashback offers across Food Villa.
          New deals drop every Monday.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {OFFERS.map((o) => (
          <article key={o.code} className="card overflow-hidden">
            <div className={`bg-gradient-to-br p-5 text-white ${o.color}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <o.icon size={20} />
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-wider">
                  CODE: {o.code}
                </span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold">{o.title}</h2>
              <p className="text-sm text-white/90">{o.sub}</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-ink-soft">{o.detail}</p>
              <Link
                href="/restaurants"
                className="btn-ghost mt-4 border border-cream-dark"
              >
                Find restaurants
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-cream-dark p-6 text-center text-sm text-ink-muted">
        Want an offer for your restaurant? <Link href="/partner/restaurant" className="text-brand-600 hover:underline">List with us</Link> and reach hungry customers.
      </div>
    </div>
  );
}

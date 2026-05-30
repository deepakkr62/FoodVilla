import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChefHat, LineChart, Smartphone, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "List your restaurant",
};

const BENEFITS = [
  {
    icon: Store,
    title: "Reach hungry customers",
    body: "Your menu in front of thousands of locals browsing for their next meal.",
  },
  {
    icon: Smartphone,
    title: "Live owner dashboard",
    body: "See orders the second they're placed. Accept, prep, dispatch — all in one place.",
  },
  {
    icon: LineChart,
    title: "Transparent metrics",
    body: "Track average rating, prep time, popular dishes. Real numbers, not gut feel.",
  },
  {
    icon: BadgeCheck,
    title: "Auto-approval",
    body: "List today, accept orders tomorrow. Approval is automatic in v1.",
  },
];

export default function RestaurantPartnerPage() {
  return (
    <div>
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-cream to-cream-dark" />
        <div className="container-narrow grid gap-8 py-16 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
              <ChefHat size={12} /> For Restaurants
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              List your restaurant on <span className="text-brand-500">Food Villa</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-soft">
              Three minutes to sign up. Add your menu and start receiving
              orders. No setup fee, no commitment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup?role=restaurant_owner" className="btn-primary">
                Get started <ArrowRight size={16} />
              </Link>
              <Link href="/help" className="btn-ghost border border-cream-dark">
                I have questions
              </Link>
            </div>
          </div>
          <div className="card overflow-hidden p-6">
            <div className="rounded-xl bg-gradient-to-br from-brand-100 to-cream-dark p-8 text-center">
              <ChefHat className="mx-auto text-brand-600" size={48} />
              <h3 className="mt-4 font-display text-xl font-semibold">
                Already a partner?
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Sign in to your owner dashboard to manage your menu and
                orders.
              </p>
              <Link href="/login" className="btn-primary mt-4 inline-flex">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-narrow py-12">
        <h2 className="text-center font-display text-2xl font-semibold">
          Why partner with us
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon size={20} />
              </span>
              <h3 className="mt-3 font-display text-base font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-narrow pb-20">
        <div className="card overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-10 text-white">
          <h3 className="font-display text-2xl font-semibold">
            Ready to start?
          </h3>
          <p className="mt-1 text-sm text-white/85">
            Create your owner account in seconds.
          </p>
          <Link
            href="/signup?role=restaurant_owner"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:scale-[1.02]"
          >
            Sign up as a restaurant owner <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

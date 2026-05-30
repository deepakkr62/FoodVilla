import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Timer } from "lucide-react";

const FEATURES = [
  {
    icon: Timer,
    title: "Delivered in 30 min",
    body: "Hot food at your door, fast and fresh.",
    href: "/restaurants?sort=rating",
    cta: "See fastest places",
  },
  {
    icon: MapPin,
    title: "Restaurants near you",
    body: "Curated places, sorted by what locals love.",
    href: "/restaurants?near=1",
    cta: "Find nearby",
  },
  {
    icon: Sparkles,
    title: "Handpicked menus",
    body: "Chef-favorites, seasonal specials, hidden gems.",
    href: "/restaurants?minRating=4.5",
    cta: "Browse top-rated",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-cream to-cream-dark"
          aria-hidden
        />
        <div
          className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -left-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="container-narrow flex flex-col items-center pb-24 pt-20 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-brand-700 backdrop-blur">
            <Sparkles size={14} /> Now serving in your neighborhood
          </span>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">
            Taste the <span className="text-brand-500">Comfort</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base text-ink-soft sm:text-lg">
            From neighborhood favorites to chef-driven kitchens — Food Villa
            brings the best of your city to your doorstep, perfectly hot and
            beautifully presented.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/restaurants" className="btn-primary text-base">
              Explore Restaurants <ArrowRight size={18} />
            </Link>
            <Link href="/partner/restaurant" className="btn-ghost text-base">
              List your restaurant
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-narrow grid gap-6 pb-16 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body, href, cta }) => (
          <Link
            key={title}
            href={href}
            className="card group flex flex-col p-6 animate-fade-in-up transition-transform hover:-translate-y-1"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <Icon size={22} />
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-ink-muted">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-transform group-hover:translate-x-1">
              {cta} <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

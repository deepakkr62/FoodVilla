import type { Metadata } from "next";
import { Briefcase, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
};

const OPENINGS = [
  {
    title: "Senior Backend Engineer",
    location: "Remote · India",
    tags: ["Node.js", "MongoDB", "TypeScript"],
    body: "Own the order pipeline end-to-end — pricing, payments, refunds, observability.",
  },
  {
    title: "Frontend Engineer",
    location: "Remote · India",
    tags: ["React", "Next.js", "Tailwind"],
    body: "Build the customer-facing experience: discovery, cart, live tracking, profile.",
  },
  {
    title: "Restaurant Success Manager",
    location: "Pune / Mumbai · Hybrid",
    tags: ["Ops", "Communication"],
    body: "Onboard new restaurant partners, help them succeed in their first 90 days.",
  },
];

export default function CareersPage() {
  return (
    <div className="container-narrow py-10">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
          <Briefcase size={12} /> Careers
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Build food&apos;s next chapter with us
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          We&apos;re a small team obsessed with the details — great food, snappy
          UI, and respecting people&apos;s time. If that resonates, say hello.
        </p>
      </header>

      <div className="space-y-3">
        {OPENINGS.map((o) => (
          <article key={o.title} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">{o.title}</h2>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
                <MapPin size={12} /> {o.location}
              </p>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">{o.body}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {o.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={`mailto:deepakkr220399@gmail.com?subject=Application — ${encodeURIComponent(o.title)}`}
              className="btn-primary self-start"
            >
              Apply
            </a>
          </article>
        ))}
      </div>

      <div className="mt-10 card p-6 text-center text-sm text-ink-muted">
        Don&apos;t see your role? Email{" "}
        <a className="text-brand-600 hover:underline" href="mailto:deepakkr220399@gmail.com">
          deepakkr220399@gmail.com
        </a>{" "}
        — we&apos;re always open to great people.
      </div>
    </div>
  );
}

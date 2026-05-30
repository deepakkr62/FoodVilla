import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Github, Heart, Linkedin, Mail, Sparkles } from "lucide-react";
import { DeveloperAvatar } from "@/components/DeveloperAvatar";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the team behind Food Villa.",
};

const TECH_STACK = [
  { label: "Next.js 15", note: "App router, React 19" },
  { label: "TypeScript", note: "End-to-end type safety" },
  { label: "Tailwind CSS", note: "Design system" },
  { label: "Node.js + Express", note: "API + Socket.io" },
  { label: "MongoDB Atlas", note: "Cloud database" },
  { label: "Stripe", note: "Card payments" },
  { label: "JWT + bcrypt", note: "Secure auth" },
  { label: "Zustand", note: "Client state" },
];

const FEATURES = [
  "Discover 125+ restaurants across 10 cities",
  "Real-time order tracking with Socket.io",
  "Stripe payments + Cash on Delivery",
  "Reviews & ratings, only after delivered orders",
  "Restaurant owner dashboard with live incoming orders",
  "Geolocation, cuisine, price & rating filters",
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-cream to-cream-dark"
          aria-hidden
        />
        <div
          className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl"
          aria-hidden
        />
        <div className="container-narrow py-16 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-brand-700 backdrop-blur">
            <Sparkles size={14} /> About Food Villa
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Built with <span className="text-brand-500">love</span>, served with care.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-ink-soft sm:text-lg">
            Food Villa is a modern food ordering platform that brings together
            local restaurants, hungry customers, and a delightful experience.
            Every detail — from the warm color palette to the live order
            tracking — was crafted to feel effortless.
          </p>
        </div>
      </section>

      {/* Developer card */}
      <section className="container-narrow -mt-4 pb-12">
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-8 md:grid-cols-[200px_1fr] md:p-12">
            <div className="flex justify-center md:justify-start">
              <DeveloperAvatar size={180} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">
                Developed by
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
                Deepak Kumar
              </h2>
              <p className="mt-1 text-sm font-medium text-brand-600">
                Full-stack Developer
              </p>
              <p className="mt-4 max-w-prose text-sm text-ink-soft">
                A one-person team that built every layer of Food Villa — from
                the Mongoose schemas and JWT auth on the backend to the React
                components and Tailwind theme on the frontend. The goal:
                ship a real, elegant product worth using.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:deepakkr220399@gmail.com"
                  className="btn-primary"
                  aria-label="Email Deepak Kumar"
                >
                  <Mail size={16} /> deepakkr220399@gmail.com
                </a>
                <a
                  href="https://github.com/deepakkr62"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost border border-cream-dark"
                  aria-label="GitHub profile of Deepak Kumar"
                >
                  <Github size={16} /> @deepakkr62
                </a>
                <a
                  href="https://www.linkedin.com/in/kumardeepak1999/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost border border-cream-dark"
                  aria-label="LinkedIn profile of Deepak Kumar"
                >
                  <Linkedin size={16} /> Deepak Kumar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's in the box */}
      <section className="container-narrow grid gap-8 pb-12 md:grid-cols-2">
        <div className="card p-8">
          <h3 className="font-display text-xl font-semibold">What you can do here</h3>
          <ul className="mt-4 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-8">
          <h3 className="font-display text-xl font-semibold">Tech stack</h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TECH_STACK.map((t) => (
              <li key={t.label} className="rounded-xl bg-cream p-3">
                <div className="text-sm font-semibold text-ink">{t.label}</div>
                <div className="text-xs text-ink-muted">{t.note}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container-narrow pb-20">
        <div className="card overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-10 text-white">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-md">
              <Logo size={36} monoLight />
              <h3 className="mt-4 font-display text-2xl font-semibold">
                Hungry yet?
              </h3>
              <p className="mt-1 text-sm text-white/85">
                Browse restaurants, find your next favorite meal and order in
                a tap.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/restaurants"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-transform hover:scale-[1.02]"
              >
                Explore restaurants <ArrowRight size={16} />
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Heart size={16} /> Need help?
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

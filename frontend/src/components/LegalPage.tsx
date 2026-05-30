import Link from "next/link";

interface Section {
  heading: string;
  body: string | React.ReactNode;
}

export function LegalPage({
  title,
  subtitle,
  effective,
  sections,
}: {
  title: string;
  subtitle: string;
  effective: string;
  sections: Section[];
}) {
  return (
    <div className="container-narrow max-w-3xl py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-ink-muted">Legal</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
        <p className="mt-1 text-xs text-ink-muted">Effective {effective}</p>
      </header>

      <article className="card space-y-7 p-8 text-sm leading-relaxed text-ink-soft">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">
              {i + 1}. {s.heading}
            </h2>
            <div className="space-y-2">{s.body}</div>
          </section>
        ))}
        <div className="border-t border-cream-dark pt-5 text-xs text-ink-muted">
          Questions? <Link href="/help" className="text-brand-600 hover:underline">Visit Help & Support</Link>{" "}
          or email <a className="text-brand-600 hover:underline" href="mailto:deepakkr220399@gmail.com">deepakkr220399@gmail.com</a>.
        </div>
      </article>
    </div>
  );
}

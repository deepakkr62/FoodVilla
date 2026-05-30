import Link from "next/link";
import { Logo } from "./Logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-narrow flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-card md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-10 text-white md:flex">
          <Link href="/" className="inline-flex">
            <Logo size={42} monoLight />
          </Link>
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight">
              From kitchen to doorstep, beautifully.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/85">
              Discover the city&apos;s most-loved restaurants. Order in a
              tap, track in real time, savor every bite.
            </p>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/70">
            Food Villa · Taste the Comfort
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="md:hidden">
            <Logo size={36} />
          </div>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ink md:mt-0">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-ink-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthCard;

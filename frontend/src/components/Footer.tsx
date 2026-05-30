import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-dark/60 bg-white">
      <div className="container-narrow grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo size={36} />
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Discover the best restaurants near you and savor every bite,
            delivered piping hot.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/about" className="hover:text-brand-500">About</Link></li>
            <li><Link href="/careers" className="hover:text-brand-500">Careers</Link></li>
            <li><Link href="/help" className="hover:text-brand-500">Help & Support</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">For You</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/restaurants" className="hover:text-brand-500">Restaurants</Link></li>
            <li><Link href="/offers" className="hover:text-brand-500">Offers</Link></li>
            <li><Link href="/help" className="hover:text-brand-500">Help & Support</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Partner with us</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/partner/restaurant" className="hover:text-brand-500">List your restaurant</Link></li>
            <li><Link href="/partner/delivery" className="hover:text-brand-500">Become a delivery partner</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-dark/60">
        <div className="container-narrow flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} Food Villa · Built by{" "}
            <Link href="/about" className="font-medium text-ink-soft hover:text-brand-500">
              Deepak Kumar
            </Link>
          </span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand-500">Privacy</Link>
            <Link href="/terms" className="hover:text-brand-500">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

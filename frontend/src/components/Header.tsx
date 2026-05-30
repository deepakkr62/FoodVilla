import Link from "next/link";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { CartBadge } from "./CartBadge";
import { HeaderSearchButton } from "./HeaderSearchButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-dark/60 bg-cream/80 backdrop-blur-md">
      <div className="container-narrow flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo size={36} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/restaurants"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-500"
          >
            Restaurants
          </Link>
          <Link
            href="/offers"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-500"
          >
            Offers
          </Link>
          <Link
            href="/help"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-500"
          >
            Help
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <HeaderSearchButton />
          <CartBadge />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;

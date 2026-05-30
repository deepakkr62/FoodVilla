"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LayoutDashboard, Receipt, Store, UtensilsCrossed } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/owner/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/owner/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/owner/dashboard/restaurant", label: "Restaurant", icon: Store },
  { href: "/owner/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthGuard roles={["restaurant_owner"]}>
      <div className="container-narrow grid gap-8 py-8 md:grid-cols-[240px_1fr]">
        <aside className="md:sticky md:top-20 md:self-start">
          <div className="mb-4 flex items-center gap-2 text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ChefHat size={18} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Owner</p>
              <p className="font-display text-lg font-semibold leading-none">Dashboard</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-soft hover:bg-cream-dark hover:text-ink",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </AuthGuard>
  );
}

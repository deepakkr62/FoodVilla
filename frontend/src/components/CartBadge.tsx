"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cartStore";

export function CartBadge() {
  const count = useCart((s) => s.itemCount());
  return (
    <Link
      href="/cart"
      aria-label={`Cart (${count} items)`}
      className="relative rounded-full p-2 text-ink-soft transition-colors hover:bg-cream-dark hover:text-brand-500"
    >
      <ShoppingBag size={18} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

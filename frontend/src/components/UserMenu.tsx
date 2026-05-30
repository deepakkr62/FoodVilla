"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/authStore";

export function UserMenu() {
  const router = useRouter();
  const { user, hydrated, logout } = useAuth();

  if (!hydrated) {
    return <div className="h-9 w-20 animate-pulse rounded-xl bg-cream-dark" />;
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="btn-ghost hidden sm:inline-flex">
          <User size={16} />
          Sign in
        </Link>
        <Link href="/signup" className="btn-primary">
          Get Started
        </Link>
      </>
    );
  }

  const dashboard = user.role === "restaurant_owner" ? "/owner/dashboard" : "/orders";

  return (
    <div className="flex items-center gap-2">
      <Link
        href={dashboard}
        className="btn-ghost hidden text-left sm:inline-flex"
        aria-label="Account"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
      </Link>
      <button
        type="button"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        className="btn-ghost"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

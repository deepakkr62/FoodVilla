"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { useAuth, type UserRole } from "@/lib/authStore";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const signup = useAuth((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(
    params.get("role") === "restaurant_owner" ? "restaurant_owner" : "customer",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!/^[\w-.+]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
      errs.email = "Enter a valid email";
    }
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await signup({ name, email, password, role, phone: phone || undefined });
      router.push(user.role === "restaurant_owner" ? "/owner/dashboard" : "/");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join Food Villa in seconds — order, track, and earn rewards."
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Role tabs */}
        <div role="tablist" aria-label="Account type" className="grid grid-cols-2 gap-2 rounded-xl bg-cream-dark p-1">
          {(["customer", "restaurant_owner"] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all",
                role === r
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {r === "customer" ? "I'm a Customer" : "I'm a Restaurant Owner"}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink-soft">Full name</label>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input pl-9"
              placeholder="Aria Patel"
            />
          </div>
          {fieldErrors.name && <p className="mt-1 text-xs text-brand-700">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-soft">Email</label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-9"
              placeholder="you@example.com"
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-brand-700">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink-soft">Phone <span className="text-ink-muted">(optional)</span></label>
          <div className="relative">
            <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input pl-9"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-soft">Password</label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-9"
              placeholder="At least 8 characters"
            />
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs text-brand-700">{fieldErrors.password}</p>}
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}

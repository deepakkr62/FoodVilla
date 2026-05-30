"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { useAuth } from "@/lib/authStore";
import { toApiError } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!/^[\w-.+]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
      errs.email = "Enter a valid email";
    }
    if (password.length < 1) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      const defaultPath =
        user.role === "restaurant_owner" ? "/owner/dashboard" : "/";
      // Only honor `next` if it points to an internal path (no protocol).
      const target =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : defaultPath;
      router.push(target);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue ordering your favorite meals."
      footer={
        <span>
          New to Food Villa?{" "}
          <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-soft">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-9"
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-brand-700">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-soft">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-9"
              placeholder="••••••••"
              aria-invalid={!!fieldErrors.password}
            />
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-brand-700">{fieldErrors.password}</p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700"
          >
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth, type UserRole } from "@/lib/authStore";

export function AuthGuard({
  roles,
  children,
}: {
  roles?: UserRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, hydrated, roles, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (roles && !roles.includes(user.role)) return null;
  return <>{children}</>;
}

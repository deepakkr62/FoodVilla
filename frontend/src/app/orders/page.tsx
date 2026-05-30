"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import {
  listMyOrders,
  STATUS_LABEL,
  type Order,
  type OrderRestaurantRef,
} from "@/lib/orderApi";
import { cn } from "@/lib/cn";

export default function OrdersListPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <OrdersInner />
    </AuthGuard>
  );
}

function OrdersInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await listMyOrders());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="container-narrow flex h-80 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-narrow py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Your orders</h1>
        <p className="text-sm text-ink-muted">
          {orders.length === 0 ? "No orders yet" : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <Receipt className="mx-auto text-brand-500" size={32} />
          <h2 className="mt-4 font-display text-xl font-semibold">No orders yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            When you place an order, it&apos;ll show up here.
          </p>
          <Link href="/restaurants" className="btn-primary mt-5 inline-flex">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const r = o.restaurant as OrderRestaurantRef;
            return (
              <li key={o._id}>
                <Link href={`/orders/${o._id}`} className="card flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                    {typeof r === "object" && r.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.coverImageUrl} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink">
                      {typeof r === "object" ? r.name : "Restaurant"}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {o.items.length} items · {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                        o.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : o.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-brand-100 text-brand-700",
                      )}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                    <div className="mt-1 font-display font-semibold">₹{o.pricing.total}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, Clock, Loader2, Receipt } from "lucide-react";
import {
  listOwnerOrders,
  updateOrderStatus,
  STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/orderApi";
import { useOwnerOrderStream } from "@/hooks/useOrderSocket";
import { cn } from "@/lib/cn";

const NEXT_BY_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  placed: { next: "accepted", label: "Accept" },
  accepted: { next: "preparing", label: "Start preparing" },
  preparing: { next: "out_for_delivery", label: "Mark out for delivery" },
  out_for_delivery: { next: "delivered", label: "Mark delivered" },
};

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);

  async function refresh() {
    try {
      const list = await listOwnerOrders();
      setOrders(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const handlers = useMemo(
    () => ({
      onNew: (order: Order) => {
        setOrders((curr) => {
          if (curr.some((o) => o._id === order._id)) return curr;
          return [order, ...curr];
        });
        setNewCount((c) => c + 1);
      },
      onUpdate: (order: Order) => {
        setOrders((curr) => curr.map((o) => (o._id === order._id ? order : o)));
      },
    }),
    [],
  );
  useOwnerOrderStream(handlers);

  const grouped = useMemo(() => {
    const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
    const done = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
    return { active, done };
  }, [orders]);

  const advance = useCallback(
    async (id: string, next: OrderStatus) => {
      const updated = await updateOrderStatus(id, next);
      setOrders((curr) => curr.map((o) => (o._id === id ? updated : o)));
    },
    [],
  );

  const cancel = useCallback(async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    const updated = await updateOrderStatus(id, "cancelled");
    setOrders((curr) => curr.map((o) => (o._id === id ? updated : o)));
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Incoming orders</h1>
          <p className="text-sm text-ink-muted">
            Live updates · {grouped.active.length} active
          </p>
        </div>
        {newCount > 0 && (
          <button
            onClick={() => setNewCount(0)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
          >
            <Bell size={12} /> {newCount} new since you opened this page
          </button>
        )}
      </header>

      {grouped.active.length === 0 ? (
        <div className="card p-10 text-center">
          <Receipt className="mx-auto text-brand-500" size={32} />
          <h2 className="mt-4 font-display text-xl font-semibold">All caught up</h2>
          <p className="mt-1 text-sm text-ink-muted">
            New orders will appear here automatically.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {grouped.active.map((o) => (
            <OwnerOrderRow key={o._id} order={o} onAdvance={advance} onCancel={cancel} />
          ))}
        </ul>
      )}

      {grouped.done.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Completed
          </h2>
          <ul className="space-y-2 opacity-80">
            {grouped.done.map((o) => (
              <OwnerOrderRow key={o._id} order={o} compact />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function OwnerOrderRow({
  order,
  compact,
  onAdvance,
  onCancel,
}: {
  order: Order;
  compact?: boolean;
  onAdvance?: (id: string, next: OrderStatus) => void;
  onCancel?: (id: string) => void;
}) {
  const cta = NEXT_BY_STATUS[order.status];
  const customerName =
    typeof order.customer === "object"
      ? (order.customer as unknown as { name?: string }).name
      : undefined;

  return (
    <li
      className={cn(
        "card flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
        order.status === "placed" && "border-l-4 border-brand-500",
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ink-muted">#{order._id.slice(-6)}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              order.status === "delivered"
                ? "bg-green-100 text-green-700"
                : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-brand-100 text-brand-700",
            )}
          >
            {STATUS_LABEL[order.status]}
          </span>
          {order.paymentMethod === "cod" ? (
            <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] font-medium text-ink-muted">
              COD
            </span>
          ) : (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
              Paid (Card)
            </span>
          )}
        </div>
        <h3 className="mt-1 font-display text-base font-semibold text-ink">
          {customerName ?? "Customer"} · ₹{order.pricing.total}
        </h3>
        {!compact && (
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-muted">
            {order.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
          </p>
        )}
        {!compact && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
            <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()} ·{" "}
            {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
          </p>
        )}
      </div>
      {!compact && cta && (
        <div className="flex shrink-0 gap-2">
          {order.status !== "out_for_delivery" && (
            <button
              type="button"
              onClick={() => onCancel?.(order._id)}
              className="btn-ghost border border-cream-dark text-xs"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => onAdvance?.(order._id, cta.next)}
            className="btn-primary text-xs"
          >
            {cta.label}
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </li>
  );
}

"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Leaf, Loader2, MapPin, Receipt } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import {
  confirmStripeSession,
  getOrder,
  STATUS_LABEL,
  type Order,
  type OrderRestaurantRef,
} from "@/lib/orderApi";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { ReviewModal } from "@/components/ReviewModal";
import { StarRating } from "@/components/StarRating";
import { getReviewForOrder, type Review } from "@/lib/reviewApi";
import { Sparkles } from "lucide-react";

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailInner />
    </AuthGuard>
  );
}

function OrderDetailInner() {
  const params = useParams<{ id: string }>();
  const query = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const fresh = await getOrder(params.id);
      setOrder(fresh);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // On first mount, if returning from Stripe success, confirm the session.
  useEffect(() => {
    (async () => {
      const fake = query.get("fake");
      const sessionId = query.get("session_id");
      const status = query.get("status");
      if (status === "success" && (fake === "1" || sessionId)) {
        try {
          const confirmed = await confirmStripeSession(params.id, {
            fake: fake ?? undefined,
            session_id: sessionId ?? undefined,
          });
          setOrder(confirmed);
          setLoading(false);
          return;
        } catch {
          /* fall through to normal load */
        }
      }
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const onLiveUpdate = useCallback((fresh: Order) => setOrder(fresh), []);
  useOrderSocket(order?._id, onLiveUpdate);

  const [review, setReview] = useState<Review | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  useEffect(() => {
    if (!order || order.status !== "delivered") return;
    getReviewForOrder(order._id)
      .then((r) => setReview(r))
      .catch(() => {});
  }, [order?._id, order?.status]);

  if (loading) {
    return (
      <div className="container-narrow flex h-80 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="container-narrow py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Order not found</h1>
        <p className="mt-2 text-sm text-ink-muted">{error}</p>
        <Link href="/orders" className="btn-ghost mt-4 inline-flex">
          Back to orders
        </Link>
      </div>
    );
  }

  const restaurant = order.restaurant as OrderRestaurantRef;
  const isCancelled = order.status === "cancelled";
  const wasJustPlaced = order.status === "placed" || order.status === "accepted";

  return (
    <div className="container-narrow grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-5">
        {wasJustPlaced && !isCancelled && (
          <div className="card flex items-center gap-3 border-l-4 border-brand-500 p-5">
            <CheckCircle2 className="text-brand-500" size={28} />
            <div>
              <h2 className="font-display text-lg font-semibold">Order confirmed!</h2>
              <p className="text-sm text-ink-muted">
                We&apos;ve sent your order to {typeof restaurant === "object" ? restaurant.name : "the restaurant"}. Track its progress below.
              </p>
            </div>
          </div>
        )}

        <div className="card p-5">
          <header className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">Order</p>
              <h1 className="font-display text-xl font-semibold">#{order._id.slice(-8)}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Status</p>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-brand-100 text-brand-700",
                )}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
          </header>
          <OrderStatusTracker status={order.status} />
        </div>

        {order.status === "delivered" && (
          <div className="card flex items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Sparkles size={18} />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold">
                  {review ? "Thanks for your review!" : "How was your order?"}
                </h2>
                {review ? (
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <StarRating value={review.rating} size={12} readOnly />
                    {review.comment && <span>· &ldquo;{review.comment}&rdquo;</span>}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">
                    Share what you thought — it helps {typeof restaurant === "object" ? restaurant.name : "the restaurant"}.
                  </p>
                )}
              </div>
            </div>
            {!review && (
              <button onClick={() => setReviewOpen(true)} className="btn-primary text-sm">
                Rate
              </button>
            )}
          </div>
        )}

        <div className="card p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">Items</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.dishId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
                  )}
                  <span
                    className={cn(
                      "absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded border border-white bg-white text-[8px]",
                      item.isVeg ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {item.isVeg ? <Leaf size={8} /> : "●"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{item.name}</div>
                  <div className="text-xs text-ink-muted">
                    {item.quantity} × ₹{item.price}
                  </div>
                </div>
                <div className="font-display text-sm font-semibold">
                  ₹{item.price * item.quantity}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">Bill</h2>
          <Row label="Subtotal" value={`₹${order.pricing.subtotal}`} />
          <Row label="Taxes & fees" value={`₹${order.pricing.taxes}`} />
          <Row label="Delivery" value={`₹${order.pricing.deliveryFee}`} />
          <div className="my-2 border-t border-cream-dark" />
          <Row label="Total" value={`₹${order.pricing.total}`} bold />
          <p className="mt-3 text-xs text-ink-muted">
            <strong>Payment</strong>{" "}
            {order.paymentMethod === "card" ? "Card" : "Cash on delivery"} ·{" "}
            <span
              className={cn(
                order.paymentStatus === "paid"
                  ? "text-green-700"
                  : order.paymentStatus === "failed"
                    ? "text-red-700"
                    : "text-ink-muted",
              )}
            >
              {order.paymentStatus}
            </span>
          </p>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
            <MapPin size={16} className="text-brand-500" /> Delivery address
          </h2>
          <p className="text-sm text-ink-soft">
            <strong>{order.deliveryAddress.label ?? "Address"}</strong>
            <br />
            {order.deliveryAddress.line1}
            {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}
            <br />
            {order.deliveryAddress.city}
            {order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ""}{" "}
            {order.deliveryAddress.postalCode}
          </p>
        </div>

        <Link href="/orders" className="btn-ghost w-full justify-center border border-cream-dark">
          <Receipt size={14} /> View all orders
        </Link>
      </aside>

      {order.status === "delivered" && !review && (
        <ReviewModal
          open={reviewOpen}
          orderId={order._id}
          restaurantName={typeof restaurant === "object" ? restaurant.name : "the restaurant"}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => {
            getReviewForOrder(order._id).then(setReview).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        bold ? "font-display text-base font-semibold text-ink" : "text-sm text-ink-soft",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

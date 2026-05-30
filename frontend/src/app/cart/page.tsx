"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { cn } from "@/lib/cn";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const restaurantName = useCart((s) => s.restaurantName);
  const restaurantSlug = useCart((s) => s.restaurantSlug);
  const deliveryFee = useCart((s) => s.deliveryFee);
  const minOrder = useCart((s) => s.minOrder);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const taxes = useCart((s) => s.taxes());
  const total = useCart((s) => s.total());
  const belowMin = useCart((s) => s.belowMinimum());

  if (items.length === 0) {
    return (
      <div className="container-narrow py-16 text-center">
        <ShoppingBag className="mx-auto text-brand-500" size={42} />
        <h1 className="mt-4 font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Browse restaurants and add a few dishes to get started.
        </p>
        <Link href="/restaurants" className="btn-primary mt-6 inline-flex">
          Explore restaurants <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-narrow grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        <header className="mb-2 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Your cart</h1>
            {restaurantName && (
              <p className="text-sm text-ink-muted">
                From{" "}
                <Link
                  href={`/restaurants/${restaurantSlug}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {restaurantName}
                </Link>
              </p>
            )}
          </div>
          <button
            onClick={clear}
            className="text-xs font-medium text-ink-muted hover:text-brand-600"
          >
            Clear cart
          </button>
        </header>

        {items.map((item) => (
          <article key={item.dishId} className="card flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl text-brand-300">
                  🍽️
                </div>
              )}
              <span
                className={cn(
                  "absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded border border-white bg-white text-[10px]",
                  item.isVeg ? "text-green-600" : "text-red-600",
                )}
                aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
              >
                {item.isVeg ? <Leaf size={9} /> : "●"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-ink">{item.name}</h3>
              <p className="text-sm text-ink-muted">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-cream-dark px-1 py-1">
              <button
                aria-label={`Decrease ${item.name}`}
                onClick={() => setQuantity(item.dishId, item.quantity - 1)}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dark"
              >
                <Minus size={12} />
              </button>
              <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                aria-label={`Increase ${item.name}`}
                onClick={() => setQuantity(item.dishId, item.quantity + 1)}
                className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dark"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="w-20 text-right font-display font-semibold text-ink">
              ₹{item.price * item.quantity}
            </div>
            <button
              aria-label={`Remove ${item.name}`}
              onClick={() => removeItem(item.dishId)}
              className="rounded-lg p-1.5 text-ink-soft hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </section>

      <aside className="card sticky top-20 h-fit space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>

        <SummaryRow label={`Subtotal (${items.length} items)`} value={`₹${subtotal}`} />
        <SummaryRow label="Taxes & fees (5%)" value={`₹${taxes}`} />
        <SummaryRow label="Delivery" value={`₹${deliveryFee}`} />
        <div className="border-t border-cream-dark pt-3" />
        <SummaryRow label="Total" value={`₹${total}`} bold />

        {belowMin && (
          <div
            role="alert"
            className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-700"
          >
            Add ₹{minOrder - subtotal} more to reach the ₹{minOrder} minimum order.
          </div>
        )}

        <Link
          href="/checkout"
          aria-disabled={belowMin}
          className={cn(
            "btn-primary w-full",
            belowMin && "pointer-events-none opacity-60",
          )}
        >
          Proceed to checkout <ArrowRight size={16} />
        </Link>
      </aside>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        bold ? "font-display text-base font-semibold text-ink" : "text-ink-soft",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

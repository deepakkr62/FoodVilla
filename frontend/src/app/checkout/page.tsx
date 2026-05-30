"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, MapPin, Plus } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { AddressFormModal, type AddressFormValue } from "@/components/AddressFormModal";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type Address,
} from "@/lib/addressApi";
import { placeOrder } from "@/lib/orderApi";
import { useCart } from "@/lib/cartStore";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

export default function CheckoutPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <CheckoutInner />
    </AuthGuard>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const restaurantId = useCart((s) => s.restaurantId);
  const subtotal = useCart((s) => s.subtotal());
  const taxes = useCart((s) => s.taxes());
  const deliveryFee = useCart((s) => s.deliveryFee);
  const total = useCart((s) => s.total());
  const belowMin = useCart((s) => s.belowMinimum());
  const restaurantName = useCart((s) => s.restaurantName);
  const minOrder = useCart((s) => s.minOrder);
  const clearCart = useCart((s) => s.clear);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [placing, setPlacing] = useState(false);

  async function refresh() {
    try {
      const list = await listAddresses();
      setAddresses(list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      if (def) setSelectedAddress(def._id);
    } catch (err) {
      setError(toApiError(err).message);
    }
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading && items.length === 0 && !placing) {
      router.replace("/cart");
    }
  }, [items.length, loading, placing, router]);

  async function handleSubmitAddress(value: AddressFormValue) {
    if (editing) {
      const updated = await updateAddress(editing._id, value);
      setAddresses(updated);
    } else {
      const updated = await createAddress(value);
      setAddresses(updated);
      const newest = updated[updated.length - 1];
      if (newest) setSelectedAddress(newest._id);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;
    const updated = await deleteAddress(id);
    setAddresses(updated);
    if (selectedAddress === id) {
      setSelectedAddress(updated[0]?._id ?? null);
    }
  }

  async function handlePlaceOrder() {
    setError(null);
    if (!restaurantId) {
      setError("Cart is empty");
      return;
    }
    const addr = addresses.find((a) => a._id === selectedAddress);
    if (!addr) {
      setError("Pick a delivery address first");
      return;
    }
    setPlacing(true);
    try {
      const { order, checkoutUrl } = await placeOrder({
        restaurantId,
        items: items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
        deliveryAddress: {
          label: addr.label,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
        },
        paymentMethod,
      });
      // Navigate FIRST, then clear the cart — clearing first triggers the
      // "cart empty → redirect to /cart" effect and races the order redirect.
      if (checkoutUrl) {
        clearCart();
        window.location.href = checkoutUrl;
      } else {
        router.push(`/orders/${order._id}`);
        // Defer clear so the navigation has a chance to start.
        setTimeout(() => clearCart(), 100);
      }
    } catch (err) {
      setError(toApiError(err).message);
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="container-narrow flex h-80 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-narrow grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-5">
        <Link href="/cart" className="btn-ghost -ml-2 w-fit">
          <ArrowLeft size={14} /> Back to cart
        </Link>
        <h1 className="font-display text-3xl font-semibold">Checkout</h1>

        <div className="card space-y-4 p-5">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Delivery address</h2>
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="btn-ghost"
            >
              <Plus size={14} /> Add
            </button>
          </header>

          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-cream-dark p-6 text-center text-sm text-ink-muted">
              <MapPin className="mx-auto mb-2 text-brand-500" size={20} />
              Add a delivery address to continue.
            </div>
          ) : (
            <ul className="space-y-2">
              {addresses.map((a) => (
                <li key={a._id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                      selectedAddress === a._id
                        ? "border-brand-400 bg-brand-50"
                        : "border-cream-dark hover:bg-cream",
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === a._id}
                      onChange={() => setSelectedAddress(a._id)}
                      className="mt-1 accent-brand-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">{a.label || "Address"}</strong>
                        {a.isDefault && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-muted">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}, {a.city}
                        {a.state ? `, ${a.state}` : ""} {a.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="text-xs text-ink-muted hover:text-brand-600"
                        onClick={() => {
                          setEditing(a);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-ink-muted hover:text-red-600"
                        onClick={() => handleDeleteAddress(a._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-display text-lg font-semibold">Payment method</h2>
          <PaymentOption
            value="card"
            checked={paymentMethod === "card"}
            onChange={setPaymentMethod}
            title="Credit / Debit card"
            subtitle="Pay securely via Stripe"
          />
          <PaymentOption
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={setPaymentMethod}
            title="Cash on delivery"
            subtitle="Pay when your order arrives"
          />
        </div>
      </section>

      <aside className="card sticky top-20 h-fit space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        {restaurantName && (
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            From {restaurantName}
          </p>
        )}
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.dishId} className="flex justify-between">
              <span className="truncate text-ink-soft">
                {i.quantity} × {i.name}
              </span>
              <span className="text-ink">₹{i.price * i.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-cream-dark pt-3 space-y-1">
          <Row label="Subtotal" value={`₹${subtotal}`} />
          <Row label="Taxes & fees (5%)" value={`₹${taxes}`} />
          <Row label="Delivery" value={`₹${deliveryFee}`} />
          <div className="mt-2 border-t border-cream-dark pt-2">
            <Row label="Total" value={`₹${total}`} bold />
          </div>
        </div>

        {belowMin && (
          <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-700">
            Order is below the ₹{minOrder} minimum.
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={belowMin || !selectedAddress || placing}
          className="btn-primary w-full"
        >
          {placing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {placing ? "Placing order..." : "Place order"}
        </button>
      </aside>

      <AddressFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitAddress}
      />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between text-sm", bold ? "font-display text-base font-semibold text-ink" : "text-ink-soft")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PaymentOption({
  value,
  checked,
  onChange,
  title,
  subtitle,
}: {
  value: "card" | "cod";
  checked: boolean;
  onChange: (v: "card" | "cod") => void;
  title: string;
  subtitle: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-brand-400 bg-brand-50" : "border-cream-dark hover:bg-cream",
      )}
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        onChange={() => onChange(value)}
        className="accent-brand-500"
      />
      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-muted">{subtitle}</div>
      </div>
    </label>
  );
}

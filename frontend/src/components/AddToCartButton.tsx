"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cartStore";
import type { PublicDish, PublicRestaurant } from "@/lib/publicApi";

export function AddToCartButton({
  restaurant,
  dish,
}: {
  restaurant: PublicRestaurant;
  dish: PublicDish;
}) {
  const items = useCart((s) => s.items);
  const restaurantId = useCart((s) => s.restaurantId);
  const addItem = useCart((s) => s.addItem);
  const setQuantity = useCart((s) => s.setQuantity);
  const clear = useCart((s) => s.clear);

  const inCart =
    restaurantId === restaurant._id ? items.find((i) => i.dishId === dish._id) : undefined;

  const [confirming, setConfirming] = useState(false);

  function handleAdd() {
    const result = addItem(
      {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
      },
      dish,
      1,
    );
    if (result === "needs-confirm") {
      setConfirming(true);
    }
  }

  function confirmSwitch() {
    clear();
    addItem(
      {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
      },
      dish,
      1,
      true,
    );
    setConfirming(false);
  }

  if (inCart) {
    return (
      <div className="mt-2 inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-1 py-1">
        <button
          type="button"
          aria-label={`Decrease ${dish.name}`}
          onClick={() => setQuantity(dish._id, inCart.quantity - 1)}
          className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-100"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-6 text-center text-sm font-semibold text-brand-700">
          {inCart.quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase ${dish.name}`}
          onClick={() => setQuantity(dish._id, inCart.quantity + 1)}
          className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-100"
        >
          <Plus size={12} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className="btn-ghost mt-2 border border-cream-dark px-3 py-1.5 text-xs"
        aria-label={`Add ${dish.name} to cart`}
        disabled={!dish.isAvailable}
      >
        <Plus size={12} /> {dish.isAvailable ? "Add" : "Unavailable"}
      </button>
      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="max-w-md rounded-2xl bg-white p-6 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold">Replace items in cart?</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Your cart has items from another restaurant. Add this dish and start a fresh
              cart with {restaurant.name}?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirming(false)} className="btn-ghost">
                Cancel
              </button>
              <button onClick={confirmSwitch} className="btn-primary">
                Yes, replace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

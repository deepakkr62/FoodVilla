"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Store, UtensilsCrossed } from "lucide-react";
import { getMyRestaurant, type OwnerDish, type OwnerRestaurant } from "@/lib/ownerApi";

export default function OwnerOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<OwnerRestaurant | null>(null);
  const [dishes, setDishes] = useState<OwnerDish[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { restaurant, dishes } = await getMyRestaurant();
        setRestaurant(restaurant);
        setDishes(dishes ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="card animate-fade-in-up p-10 text-center">
        <Store className="mx-auto text-brand-500" size={36} />
        <h2 className="mt-4 font-display text-2xl font-semibold">Set up your restaurant</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          You&apos;re a few details away from welcoming customers. Add your
          restaurant info, then build out your menu.
        </p>
        <Link href="/owner/dashboard/restaurant" className="btn-primary mt-6 inline-flex">
          Set up restaurant <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div
          className="h-32 bg-gradient-to-br from-brand-200 via-brand-300 to-accent"
          style={
            restaurant.bannerImageUrl
              ? {
                  backgroundImage: `url(${restaurant.bannerImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">{restaurant.name}</h1>
              <p className="text-sm text-ink-muted">
                {restaurant.cuisines.join(" · ") || "—"} · {restaurant.address.city}
              </p>
            </div>
            <span
              className={
                restaurant.isOpen
                  ? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                  : "rounded-full bg-cream-dark px-3 py-1 text-xs font-semibold text-ink-muted"
              }
            >
              {restaurant.isOpen ? "Open now" : "Closed"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Menu items" value={dishes.length} />
            <Stat label="Rating" value={restaurant.rating.average.toFixed(1)} />
            <Stat label="Prep time" value={`${restaurant.prepTimeMinutes}m`} />
            <Stat label="Min order" value={`₹${restaurant.minOrder}`} />
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/owner/dashboard/restaurant" className="btn-ghost">
              Edit restaurant
            </Link>
            <Link href="/owner/dashboard/menu" className="btn-primary">
              <UtensilsCrossed size={16} />
              Manage menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}

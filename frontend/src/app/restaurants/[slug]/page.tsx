"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Leaf, MapPin, Star } from "lucide-react";
import { getRestaurantBySlug, type PublicDish, type PublicRestaurant } from "@/lib/publicApi";
import { cn } from "@/lib/cn";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ReviewsSection } from "@/components/ReviewsSection";

export default function RestaurantDetailPage() {
  const params = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [dishes, setDishes] = useState<PublicDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRestaurantBySlug(params.slug);
        setRestaurant(res.restaurant);
        setDishes(res.dishes);
      } catch {
        setError("Restaurant not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.slug]);

  const grouped = useMemo(() => {
    const m = new Map<string, PublicDish[]>();
    for (const d of dishes) {
      const cat = d.category || "Other";
      if (!m.has(cat)) m.set(cat, []);
      m.get(cat)!.push(d);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [dishes]);

  const popularDishes = useMemo(
    () => dishes.filter((d) => d.isPopular).slice(0, 4),
    [dishes],
  );

  if (loading) {
    return (
      <div className="container-narrow flex h-80 items-center justify-center text-ink-muted">
        Loading...
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container-narrow py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Restaurant not found</h1>
        <p className="mt-2 text-sm text-ink-muted">{error}</p>
      </div>
    );
  }

  const priceSymbol = "₹".repeat(restaurant.priceRange);

  return (
    <div>
      {/* Hero banner */}
      <section
        className="relative h-56 w-full sm:h-72"
        style={
          restaurant.bannerImageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.5)), url(${restaurant.bannerImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!restaurant.bannerImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-300 via-brand-400 to-brand-600" />
        )}
        <div className="container-narrow relative flex h-full flex-col justify-end pb-6 text-white">
          <div className="flex flex-wrap items-end gap-2 text-xs uppercase tracking-wider text-white/80">
            <span>{restaurant.cuisines.join(" · ") || "Various"}</span>
            <span>·</span>
            <span>{priceSymbol}</span>
            {!restaurant.isOpen && (
              <span className="rounded-full bg-ink/70 px-2 py-0.5 font-semibold text-white">
                Closed
              </span>
            )}
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-5xl">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
              {restaurant.description}
            </p>
          )}
        </div>
      </section>

      <div className="container-narrow -mt-8 grid gap-6 pb-16 lg:grid-cols-[1fr_320px]">
        {/* Menu */}
        <section className="space-y-8">
          <div className="card grid grid-cols-3 gap-4 p-5 text-center sm:grid-cols-4">
            <Meta
              label="Rating"
              value={
                restaurant.rating.average > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="fill-accent text-accent" />
                    {restaurant.rating.average.toFixed(1)}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Meta
              label="Prep time"
              value={
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {restaurant.prepTimeMinutes}m
                </span>
              }
            />
            <Meta label="Delivery" value={`₹${restaurant.deliveryFee}`} />
            <Meta label="Min order" value={`₹${restaurant.minOrder}`} />
          </div>

          {popularDishes.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-dark">
                  Popular
                </span>
                Most ordered
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {popularDishes.map((d) => (
                  <DishItem key={`popular-${d._id}`} dish={d} restaurant={restaurant} />
                ))}
              </div>
            </section>
          )}

          {grouped.length === 0 ? (
            <div className="card p-10 text-center text-ink-muted">
              Menu isn&apos;t available right now.
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="border-t border-cream-dark pt-6 font-display text-xl font-semibold text-ink">
                Full menu
                <span className="ml-2 text-sm font-normal text-ink-muted">
                  ({dishes.length} {dishes.length === 1 ? "item" : "items"})
                </span>
              </h2>
              {grouped.map(([category, items]) => (
                <section key={category}>
                  <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wider text-ink-muted">
                    {category}{" "}
                    <span className="text-xs font-normal normal-case">
                      ({items.length})
                    </span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {items.map((d) => (
                      <DishItem key={d._id} dish={d} restaurant={restaurant} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <ReviewsSection slugOrId={restaurant.slug} />
        </section>

        {/* Sidebar */}
        <aside className="card sticky top-20 h-fit space-y-4 p-5">
          <h3 className="font-display text-lg font-semibold">About</h3>
          <p className="flex items-start gap-2 text-sm text-ink-soft">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-brand-500" />
            <span>
              {restaurant.address.line1}
              {restaurant.address.line2 ? `, ${restaurant.address.line2}` : ""}
              <br />
              {restaurant.address.city}
              {restaurant.address.state ? `, ${restaurant.address.state}` : ""}{" "}
              {restaurant.address.postalCode}
            </span>
          </p>
          <div className="border-t border-cream-dark pt-3 text-sm text-ink-muted">
            <p>
              <strong className="text-ink">Delivery</strong> ₹{restaurant.deliveryFee} · Min ₹
              {restaurant.minOrder}
            </p>
            <p>
              <strong className="text-ink">Avg prep</strong> {restaurant.prepTimeMinutes} min
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-0.5 font-display text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function DishItem({ dish, restaurant }: { dish: PublicDish; restaurant: PublicRestaurant }) {
  return (
    <article className="card flex gap-3 p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-brand-300">
            🍽️
          </div>
        )}
        <span
          className={cn(
            "absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded border border-white bg-white text-[10px]",
            dish.isVeg ? "text-green-600" : "text-red-600",
          )}
          aria-label={dish.isVeg ? "Vegetarian" : "Non-vegetarian"}
        >
          {dish.isVeg ? <Leaf size={10} /> : "●"}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display font-semibold text-ink">{dish.name}</h4>
          <span className="font-display text-base font-semibold text-ink">₹{dish.price}</span>
        </div>
        {dish.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{dish.description}</p>
        )}
        <AddToCartButton restaurant={restaurant} dish={dish} />
      </div>
    </article>
  );
}

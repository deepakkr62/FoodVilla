import Link from "next/link";
import { Clock, MapPin, Star } from "lucide-react";
import type { PublicRestaurant } from "@/lib/publicApi";

/** Zomato-style "cost for two" based on price tier (1-4). */
const COST_FOR_TWO: Record<1 | 2 | 3 | 4, number> = {
  1: 200,
  2: 500,
  3: 900,
  4: 1500,
};

/** Force smaller Unsplash variants for card thumbnails (much faster than w=900). */
function smaller(url: string | undefined, w: number): string | undefined {
  if (!url) return url;
  return url.replace(/(\?|&)w=\d+/, (_m, sep) => `${sep}w=${w}`);
}

export function RestaurantCard({
  restaurant,
  eager = false,
}: {
  restaurant: PublicRestaurant;
  /** Set true for the first few cards above the fold so they don't lazy-load. */
  eager?: boolean;
}) {
  const costForTwo = COST_FOR_TWO[restaurant.priceRange];
  const cover = smaller(restaurant.coverImageUrl, 480);

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="card group overflow-hidden"
      aria-label={`Open ${restaurant.name}`}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-cream-dark">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={restaurant.name}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            width={480}
            height={288}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-200 via-brand-300 to-accent text-5xl">
            🍽️
          </div>
        )}
        {!restaurant.isOpen && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Closed
          </span>
        )}
        {restaurant.rating.average > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
            <Star size={12} className="fill-accent text-accent" />
            {restaurant.rating.average.toFixed(1)}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-tight text-ink">
            {restaurant.name}
          </h3>
          <span className="shrink-0 text-right text-xs text-ink-muted">
            <span className="block font-semibold text-ink">₹{costForTwo}</span>
            <span>for two</span>
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-ink-muted">
          {restaurant.cuisines.slice(0, 3).join(" · ") || "—"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {restaurant.prepTimeMinutes}m
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {restaurant.address.city}
          </span>
          {restaurant.deliveryFee > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>Delivery ₹{restaurant.deliveryFee}</span>
            </>
          )}
          {restaurant.minOrder > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>Min ₹{restaurant.minOrder}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FilterPanel, type FilterValue } from "@/components/FilterPanel";
import { LocationButton, type Coords } from "@/components/LocationButton";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBar } from "@/components/SearchBar";
import { listRestaurants, type PublicRestaurant } from "@/lib/publicApi";
import { nearestCity } from "@/lib/cities";

const PAGE_SIZE = 24;

export default function RestaurantsPage() {
  // useSearchParams requires a Suspense boundary for the production build.
  return (
    <Suspense
      fallback={
        <div className="container-narrow flex h-80 items-center justify-center text-ink-muted">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <RestaurantsPageInner />
    </Suspense>
  );
}

function RestaurantsPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const initialFilters = useMemo<FilterValue>(
    () => ({
      cuisine: params.get("cuisine") ?? undefined,
      maxPrice: params.get("maxPrice")
        ? (Number(params.get("maxPrice")) as 1 | 2 | 3 | 4)
        : undefined,
      minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
      sort: (params.get("sort") as "rating" | "newest" | null) ?? undefined,
    }),
    [params],
  );
  const initialQ = params.get("q") ?? "";
  const initialCoords: Coords | undefined = useMemo(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
  }, [params]);

  const [filters, setFilters] = useState<FilterValue>(initialFilters);
  const [q, setQ] = useState(initialQ);
  const [coords, setCoords] = useState<Coords | undefined>(initialCoords);
  // Resolve the user's GPS to the nearest city we actually serve — our seed
  // restaurants all use city-center coordinates, so a tight radius would
  // return zero. City-level filter is far more useful in practice.
  const detectedCity = useMemo(
    () => (coords ? nearestCity(coords) : null),
    [coords],
  );
  const [items, setItems] = useState<PublicRestaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  // Auto-request location when arriving with ?near=1 (e.g., from the home page).
  const nearFlag = params.get("near");
  useEffect(() => {
    if (nearFlag !== "1" || coords) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        /* user denied — they can still click "Near me" manually */
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
    // Only run on first mount with ?near=1. Removing the flag from the URL
    // happens automatically via the state-syncing effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearFlag]);

  // Sync state → URL (shareable filters)
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (filters.cuisine) next.set("cuisine", filters.cuisine);
    if (filters.maxPrice) next.set("maxPrice", String(filters.maxPrice));
    if (filters.minRating) next.set("minRating", String(filters.minRating));
    if (filters.sort) next.set("sort", filters.sort);
    if (coords) {
      next.set("lat", String(coords.lat));
      next.set("lng", String(coords.lng));
    }
    const qs = next.toString();
    router.replace(`/restaurants${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [q, filters, coords, router]);

  const fetchPage = useCallback(
    async (nextPage: number, mode: "replace" | "append") => {
      if (mode === "replace") setLoadingFirst(true);
      else setLoadingMore(true);
      try {
        // When the user has shared their location, filter by the closest
        // supported city rather than a tight geo radius (our seed data uses
        // city-center coords, so a 10km radius would return zero).
        const res = await listRestaurants({
          q: q || undefined,
          cuisine: filters.cuisine,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          city: detectedCity?.city.name,
          sort: filters.sort,
          page: nextPage,
          limit: PAGE_SIZE,
        });
        setTotal(res.total);
        setPage(nextPage);
        if (mode === "replace") {
          setItems(res.items);
        } else {
          setItems((prev) => [...prev, ...res.items]);
        }
        setReachedEnd(nextPage * PAGE_SIZE >= res.total || res.items.length === 0);
      } finally {
        if (mode === "replace") setLoadingFirst(false);
        else setLoadingMore(false);
      }
    },
    [q, filters, detectedCity],
  );

  // Reload page 1 when any filter changes.
  useEffect(() => {
    fetchPage(1, "replace");
  }, [fetchPage]);

  // Infinite scroll only for the first extra page (24 → 48). After that we
  // switch to a manual "Load more" button so users don't feel out of control.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (loadingFirst || loadingMore || reachedEnd) return;
    if (page >= 2) return; // only auto-load once
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fetchPage(page + 1, "append");
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, loadingFirst, loadingMore, reachedEnd, fetchPage]);

  const visibleCount = items.length;
  const remaining = Math.max(0, total - visibleCount);

  return (
    <div className="container-narrow py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Discover restaurants
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {loadingFirst
            ? "Searching..."
            : `Showing ${visibleCount} of ${total} ${total === 1 ? "place" : "places"} to taste`}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar initialValue={q} onSubmit={setQ} />
        </div>
        <LocationButton
          coords={coords}
          cityName={detectedCity?.city.name}
          onSet={setCoords}
          onClear={() => setCoords(undefined)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel
          value={filters}
          onChange={setFilters}
          onClear={() => {
            setFilters({});
            setQ("");
            setCoords(undefined);
          }}
        />

        <section>
          {loadingFirst ? (
            <div className="flex h-60 items-center justify-center text-ink-muted">
              <Loader2 className="animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="card p-10 text-center">
              <h2 className="font-display text-xl font-semibold">No results</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Try removing a filter or searching for something else.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((r, idx) => (
                  <RestaurantCard
                    key={r._id}
                    restaurant={r}
                    eager={idx < 6}
                  />
                ))}
              </div>
              <div
                ref={sentinelRef}
                className="mt-8 flex flex-col items-center justify-center gap-3 text-ink-muted"
                aria-live="polite"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Loader2 className="animate-spin" size={14} />
                    Loading more...
                  </span>
                ) : reachedEnd ? (
                  <span className="text-xs uppercase tracking-wider">
                    You&apos;ve reached the end · {total} restaurants
                  </span>
                ) : page < 2 ? (
                  <span className="text-xs text-ink-muted/60">Scroll for more</span>
                ) : (
                  <>
                    <p className="text-sm text-ink-soft">
                      Showing {visibleCount} of {total} ·{" "}
                      <span className="font-semibold">{remaining} more</span> to discover
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchPage(page + 1, "append")}
                      className="btn-primary"
                    >
                      Load more restaurants
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

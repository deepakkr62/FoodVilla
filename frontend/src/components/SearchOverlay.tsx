"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Search, Star, TrendingUp, X } from "lucide-react";
import { listRestaurants, type PublicRestaurant, COMMON_CUISINES } from "@/lib/publicApi";

const QUICK_SEARCHES = ["Pizza", "Biryani", "Chinese", "Burger", "Sushi", "Dosa"];

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PublicRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  // Focus input on open + handle Esc to close.
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset state when closed.
  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  // Debounced search: trigger ~300ms after the user stops typing.
  useEffect(() => {
    if (!open) return;
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await listRestaurants({ q: q.trim(), limit: 8 });
        setResults(res.items);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q, open]);

  function go(href: string) {
    router.push(href);
    onClose();
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    go(`/restaurants?q=${encodeURIComponent(q.trim())}`);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Food Villa"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/50 p-4 pt-[10vh] backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 border-b border-cream-dark bg-white p-3"
        >
          <Search size={18} className="ml-2 text-ink-muted" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants, cuisines, dishes..."
            aria-label="Search query"
            className="flex-1 bg-transparent text-base placeholder:text-ink-muted focus:outline-none"
          />
          {loading && <Loader2 size={16} className="animate-spin text-ink-muted" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-dark"
          >
            <X size={16} />
          </button>
        </form>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() && results.length === 0 && !loading && (
            <div className="p-8 text-center text-sm text-ink-muted">
              No restaurants match &ldquo;{q.trim()}&rdquo;. Try a different word, or
              <Link
                href={`/restaurants?q=${encodeURIComponent(q.trim())}`}
                className="ml-1 text-brand-600 hover:underline"
                onClick={onClose}
              >
                browse all restaurants
              </Link>
              .
            </div>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-cream-dark">
              {results.map((r) => (
                <li key={r._id}>
                  <button
                    type="button"
                    onClick={() => go(`/restaurants/${r.slug}`)}
                    className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-cream"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                      {r.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.coverImageUrl.replace(/(\?|&)w=\d+/, "$1w=200")}
                          alt={r.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-sm font-semibold text-ink">
                        {r.name}
                      </div>
                      <div className="truncate text-xs text-ink-muted">
                        {r.cuisines.slice(0, 3).join(" · ")}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-ink-muted">
                        <span className="inline-flex items-center gap-0.5">
                          <Star size={10} className="fill-accent text-accent" />
                          {r.rating.average.toFixed(1)}
                        </span>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin size={10} />
                          {r.address.city}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              <li className="bg-cream/40 px-4 py-3 text-center">
                <Link
                  href={`/restaurants?q=${encodeURIComponent(q.trim())}`}
                  onClick={onClose}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  See all results for &ldquo;{q.trim()}&rdquo; →
                </Link>
              </li>
            </ul>
          )}

          {!q.trim() && (
            <div className="space-y-5 p-5">
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <TrendingUp size={12} /> Trending searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQ(s)}
                      className="rounded-full border border-cream-dark bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-600"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Browse by cuisine
                </h3>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CUISINES.slice(0, 8).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        go(`/restaurants?cuisine=${encodeURIComponent(c)}`)
                      }
                      className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>
              <div className="rounded-xl border border-dashed border-cream-dark p-3 text-[10px] text-ink-muted">
                <span className="font-semibold">Pro tip:</span> press{" "}
                <kbd className="rounded border border-cream-dark bg-cream px-1.5 py-0.5 font-mono">
                  Esc
                </kbd>{" "}
                to close · Enter to see all results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

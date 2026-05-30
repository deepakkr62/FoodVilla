"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { listRestaurantReviews, type Review } from "@/lib/reviewApi";

export function ReviewsSection({ slugOrId }: { slugOrId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ average: number; count: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listRestaurantReviews(slugOrId);
        setReviews(res.reviews);
        setMeta(res.rating);
      } finally {
        setLoading(false);
      }
    })();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <section>
      <header className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Reviews</h2>
        {meta && (
          <div className="text-right">
            <div className="font-display text-2xl font-semibold leading-none">
              {meta.average > 0 ? meta.average.toFixed(1) : "—"}
            </div>
            <div className="mt-0.5 text-xs text-ink-muted">
              {meta.count} {meta.count === 1 ? "review" : "reviews"}
            </div>
          </div>
        )}
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-cream-dark p-6 text-center text-sm text-ink-muted">
          No reviews yet — be the first to share your experience!
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => {
            const customer =
              typeof r.customer === "object"
                ? r.customer
                : { name: "Customer", avatarUrl: undefined };
            return (
              <li key={r._id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-ink">{customer.name}</strong>
                      <StarRating value={r.rating} size={14} readOnly />
                    </div>
                    <p className="text-[10px] uppercase tracking-wide text-ink-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    {r.comment && (
                      <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

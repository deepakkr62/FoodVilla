"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { StarRating } from "./StarRating";
import { createReview } from "@/lib/reviewApi";
import { toApiError } from "@/lib/api";

export function ReviewModal({
  open,
  orderId,
  restaurantName,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  orderId: string;
  restaurantName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) {
      setError("Please pick a rating");
      return;
    }
    setSaving(true);
    try {
      await createReview({ orderId, rating, comment: comment.trim() || undefined });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rate your order"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-muted hover:bg-cream-dark"
        >
          <X size={18} />
        </button>
        <h2 className="font-display text-xl font-semibold">Rate your order</h2>
        <p className="text-sm text-ink-muted">How was {restaurantName}?</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-col items-center gap-1">
            <StarRating value={rating} onChange={setRating} size={28} />
            <span className="text-xs text-ink-muted">{rating === 0 ? "Tap a star" : `${rating} of 5`}</span>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-soft">Comment (optional)</span>
            <textarea
              className="input min-h-24"
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you loved..."
            />
          </label>

          {error && (
            <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={16} className="animate-spin" />}
              Submit review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

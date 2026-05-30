"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function StarRating({
  value,
  onChange,
  size = 18,
  readOnly,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" role={readOnly ? "img" : "radiogroup"} aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            type="button"
            key={n}
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={cn(
              "rounded p-0.5 transition-colors",
              !readOnly && "hover:bg-cream-dark",
              readOnly && "cursor-default",
            )}
          >
            <Star
              size={size}
              className={cn(
                filled ? "fill-accent text-accent" : "text-cream-dark",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

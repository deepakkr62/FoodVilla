"use client";

import { COMMON_CUISINES } from "@/lib/publicApi";
import { cn } from "@/lib/cn";

export interface FilterValue {
  cuisine?: string;
  maxPrice?: 1 | 2 | 3 | 4;
  minRating?: number;
  sort?: "rating" | "newest";
}

export function FilterPanel({
  value,
  onChange,
  onClear,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  onClear: () => void;
}) {
  function set<K extends keyof FilterValue>(key: K, v: FilterValue[K]) {
    onChange({ ...value, [key]: v });
  }
  function toggle<K extends keyof FilterValue>(key: K, v: FilterValue[K]) {
    onChange({ ...value, [key]: value[key] === v ? undefined : v });
  }

  return (
    <aside className="card sticky top-20 space-y-6 self-start p-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Filters
        </h2>
        <button onClick={onClear} className="text-xs font-medium text-brand-600 hover:underline">
          Clear all
        </button>
      </header>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">Cuisine</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cuisine filter">
          {COMMON_CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={value.cuisine === c}
              onClick={() => toggle("cuisine", c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                value.cuisine === c
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-cream-dark bg-white text-ink-soft hover:border-brand-300",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-ink">Cost for two</h3>
        <p className="mb-2 text-[10px] text-ink-muted">
          Approximate price tier
        </p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Price filter">
          {[
            { tier: 1 as const, label: "Under ₹200", sub: "Budget" },
            { tier: 2 as const, label: "Under ₹500", sub: "Casual" },
            { tier: 3 as const, label: "Under ₹900", sub: "Premium" },
            { tier: 4 as const, label: "Under ₹1500", sub: "Fine dining" },
          ].map((p) => (
            <button
              key={p.tier}
              type="button"
              aria-pressed={value.maxPrice === p.tier}
              onClick={() => toggle("maxPrice", p.tier)}
              className={cn(
                "rounded-xl border px-2 py-2 text-center transition-colors",
                value.maxPrice === p.tier
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-cream-dark bg-white text-ink-soft hover:border-brand-300",
              )}
            >
              <div className="text-xs font-semibold">{p.label}</div>
              <div className="text-[10px] uppercase tracking-wide text-ink-muted">
                {p.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">Min rating</h3>
        <div className="flex gap-2" role="group" aria-label="Rating filter">
          {[4.5, 4, 3.5, 3].map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={value.minRating === r}
              onClick={() => toggle("minRating", r)}
              className={cn(
                "flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                value.minRating === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-cream-dark bg-white text-ink-soft hover:border-brand-300",
              )}
            >
              {r}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">Sort by</h3>
        <select
          className="input"
          value={value.sort ?? "rating"}
          onChange={(e) => set("sort", e.target.value as "rating" | "newest")}
        >
          <option value="rating">Rating (high to low)</option>
          <option value="newest">Newest first</option>
        </select>
      </div>
    </aside>
  );
}

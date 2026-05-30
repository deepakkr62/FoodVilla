"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { OwnerDish } from "@/lib/ownerApi";

export interface DishFormValue {
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  tags: string[];
}

const empty: DishFormValue = {
  name: "",
  description: "",
  category: "Main",
  price: 0,
  imageUrl: "",
  isVeg: true,
  isAvailable: true,
  isPopular: false,
  tags: [],
};

export function DishFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: OwnerDish | null;
  onClose: () => void;
  onSubmit: (value: DishFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState<DishFormValue>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setValue({
        name: initial.name,
        description: initial.description ?? "",
        category: initial.category,
        price: initial.price,
        imageUrl: initial.imageUrl ?? "",
        isVeg: initial.isVeg,
        isAvailable: initial.isAvailable,
        isPopular: initial.isPopular,
        tags: initial.tags,
      });
    } else {
      setValue(empty);
    }
    setError(null);
  }, [initial, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (value.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (value.price < 0) {
      setError("Price cannot be negative");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      setError((err as Error)?.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={initial ? "Edit dish" : "Add dish"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-card-hover animate-fade-in-up"
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
        <h2 className="mb-4 font-display text-xl font-semibold">
          {initial ? "Edit dish" : "Add dish"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Name">
            <input
              className="input"
              required
              value={value.name}
              onChange={(e) => setValue((v) => ({ ...v, name: e.target.value }))}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input min-h-20"
              value={value.description}
              onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Category">
              <input
                className="input"
                value={value.category}
                onChange={(e) => setValue((v) => ({ ...v, category: e.target.value }))}
              />
            </Field>
            <Field label="Price (₹)">
              <input
                type="number"
                min={0}
                className="input"
                value={value.price}
                onChange={(e) => setValue((v) => ({ ...v, price: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Image URL">
              <input
                className="input"
                value={value.imageUrl}
                onChange={(e) => setValue((v) => ({ ...v, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </Field>
          </div>
          <Field label="Tags (comma separated)">
            <input
              className="input"
              value={value.tags.join(", ")}
              onChange={(e) =>
                setValue((v) => ({
                  ...v,
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
          </Field>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-500"
                checked={value.isVeg}
                onChange={(e) => setValue((v) => ({ ...v, isVeg: e.target.checked }))}
              />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-500"
                checked={value.isAvailable}
                onChange={(e) => setValue((v) => ({ ...v, isAvailable: e.target.checked }))}
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-500"
                checked={value.isPopular}
                onChange={(e) => setValue((v) => ({ ...v, isPopular: e.target.checked }))}
              />
              Popular
            </label>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {initial ? "Save" : "Add dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

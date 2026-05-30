"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  type OwnerRestaurant,
} from "@/lib/ownerApi";
import { toApiError } from "@/lib/api";

const blank: Partial<OwnerRestaurant> = {
  name: "",
  description: "",
  cuisines: [],
  priceRange: 2,
  address: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "IN" },
  deliveryFee: 0,
  minOrder: 0,
  prepTimeMinutes: 30,
  isOpen: true,
};

export default function RestaurantSettingsPage() {
  const [form, setForm] = useState<Partial<OwnerRestaurant>>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { restaurant } = await getMyRestaurant();
        if (restaurant) {
          setForm(restaurant);
          setIsNew(false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof OwnerRestaurant>(key: K, value: OwnerRestaurant[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setAddress<K extends keyof OwnerRestaurant["address"]>(
    key: K,
    value: OwnerRestaurant["address"][K],
  ) {
    setForm((f) => ({
      ...f,
      address: { ...(f.address ?? blank.address!), [key]: value },
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setSaving(true);
    try {
      const saved = isNew
        ? await createMyRestaurant(form)
        : await updateMyRestaurant(form);
      setForm(saved);
      setIsNew(false);
      setOk(isNew ? "Restaurant created!" : "Saved.");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-ink-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">
          {isNew ? "Set up your restaurant" : "Restaurant details"}
        </h1>
        <p className="text-sm text-ink-muted">
          {isNew
            ? "Tell us about your place — you can refine these later."
            : "Update what customers see on your storefront."}
        </p>
      </header>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Basics</h2>
        <Field label="Name" required>
          <input
            className="input"
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            required
            minLength={2}
            maxLength={120}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="input min-h-24"
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            maxLength={1000}
            placeholder="What makes your place special?"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cuisines (comma separated)">
            <input
              className="input"
              value={(form.cuisines ?? []).join(", ")}
              onChange={(e) =>
                set(
                  "cuisines",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Indian, Tandoor, Biryani"
            />
          </Field>
          <Field label="Price range">
            <select
              className="input"
              value={form.priceRange ?? 2}
              onChange={(e) =>
                set("priceRange", Number(e.target.value) as 1 | 2 | 3 | 4)
              }
            >
              <option value={1}>₹ Budget</option>
              <option value={2}>₹₹ Casual</option>
              <option value={3}>₹₹₹ Premium</option>
              <option value={4}>₹₹₹₹ Fine dining</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Address</h2>
        <Field label="Address line 1" required>
          <input
            className="input"
            value={form.address?.line1 ?? ""}
            onChange={(e) => setAddress("line1", e.target.value)}
            required
          />
        </Field>
        <Field label="Address line 2">
          <input
            className="input"
            value={form.address?.line2 ?? ""}
            onChange={(e) => setAddress("line2", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" required>
            <input
              className="input"
              value={form.address?.city ?? ""}
              onChange={(e) => setAddress("city", e.target.value)}
              required
            />
          </Field>
          <Field label="State">
            <input
              className="input"
              value={form.address?.state ?? ""}
              onChange={(e) => setAddress("state", e.target.value)}
            />
          </Field>
          <Field label="Postal code" required>
            <input
              className="input"
              value={form.address?.postalCode ?? ""}
              onChange={(e) => setAddress("postalCode", e.target.value)}
              required
            />
          </Field>
        </div>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-3">
        <Field label="Delivery fee (₹)">
          <input
            type="number"
            min={0}
            className="input"
            value={form.deliveryFee ?? 0}
            onChange={(e) => set("deliveryFee", Number(e.target.value))}
          />
        </Field>
        <Field label="Min order (₹)">
          <input
            type="number"
            min={0}
            className="input"
            value={form.minOrder ?? 0}
            onChange={(e) => set("minOrder", Number(e.target.value))}
          />
        </Field>
        <Field label="Prep time (min)">
          <input
            type="number"
            min={5}
            max={180}
            className="input"
            value={form.prepTimeMinutes ?? 30}
            onChange={(e) => set("prepTimeMinutes", Number(e.target.value))}
          />
        </Field>
        <Field label="Cover image URL" className="sm:col-span-2">
          <input
            className="input"
            value={form.coverImageUrl ?? ""}
            onChange={(e) => set("coverImageUrl", e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <Field label="Banner image URL">
          <input
            className="input"
            value={form.bannerImageUrl ?? ""}
            onChange={(e) => set("bannerImageUrl", e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <label className="flex items-center gap-2 sm:col-span-3">
          <input
            type="checkbox"
            checked={!!form.isOpen}
            onChange={(e) => set("isOpen", e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          <span className="text-sm text-ink-soft">Restaurant is currently open</span>
        </label>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          {error}
        </div>
      )}
      {ok && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {ok}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isNew ? "Create restaurant" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink-soft">
        {label} {required && <span className="text-brand-600">*</span>}
      </span>
      {children}
    </label>
  );
}

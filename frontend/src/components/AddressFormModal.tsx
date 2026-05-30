"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Address } from "@/lib/addressApi";

export interface AddressFormValue {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const empty: AddressFormValue = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  isDefault: false,
};

export function AddressFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: Address | null;
  onClose: () => void;
  onSubmit: (value: AddressFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState<AddressFormValue>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(initial ?? empty);
    setError(null);
  }, [initial, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (value.line1.trim().length < 2 || value.city.trim().length < 1 || !value.postalCode) {
      setError("Address line, city and postal code are required");
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
      aria-label={initial ? "Edit address" : "Add address"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card-hover"
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
          {initial ? "Edit address" : "Add address"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Label (Home, Work…)">
            <input
              className="input"
              value={value.label ?? ""}
              onChange={(e) => setValue((v) => ({ ...v, label: e.target.value }))}
            />
          </Field>
          <Field label="Address line 1">
            <input
              required
              className="input"
              value={value.line1}
              onChange={(e) => setValue((v) => ({ ...v, line1: e.target.value }))}
            />
          </Field>
          <Field label="Address line 2">
            <input
              className="input"
              value={value.line2 ?? ""}
              onChange={(e) => setValue((v) => ({ ...v, line2: e.target.value }))}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="City">
              <input
                required
                className="input"
                value={value.city}
                onChange={(e) => setValue((v) => ({ ...v, city: e.target.value }))}
              />
            </Field>
            <Field label="State">
              <input
                className="input"
                value={value.state ?? ""}
                onChange={(e) => setValue((v) => ({ ...v, state: e.target.value }))}
              />
            </Field>
            <Field label="Postal code">
              <input
                required
                className="input"
                value={value.postalCode}
                onChange={(e) => setValue((v) => ({ ...v, postalCode: e.target.value }))}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-500"
              checked={!!value.isDefault}
              onChange={(e) => setValue((v) => ({ ...v, isDefault: e.target.checked }))}
            />
            Set as default
          </label>
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
              {initial ? "Save" : "Add address"}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, UtensilsCrossed } from "lucide-react";
import { DishCard } from "@/components/owner/DishCard";
import { DishFormModal, type DishFormValue } from "@/components/owner/DishFormModal";
import {
  createDish,
  deleteDish,
  listMyDishes,
  updateDish,
  type OwnerDish,
} from "@/lib/ownerApi";
import { toApiError } from "@/lib/api";

export default function MenuPage() {
  const [dishes, setDishes] = useState<OwnerDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OwnerDish | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const list = await listMyDishes();
      setDishes(list);
    } catch (err) {
      setError(toApiError(err).message);
    }
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, OwnerDish[]>();
    for (const d of dishes) {
      const cat = d.category || "Other";
      if (!m.has(cat)) m.set(cat, []);
      m.get(cat)!.push(d);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [dishes]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(d: OwnerDish) {
    setEditing(d);
    setModalOpen(true);
  }

  async function handleSubmit(value: DishFormValue) {
    if (editing) {
      await updateDish(editing._id, value);
    } else {
      await createDish(value);
    }
    await refresh();
  }

  async function handleDelete(d: OwnerDish) {
    if (!confirm(`Delete "${d.name}"?`)) return;
    try {
      await deleteDish(d._id);
      setDishes((list) => list.filter((x) => x._id !== d._id));
    } catch (err) {
      setError(toApiError(err).message);
    }
  }

  async function handleToggleAvailable(d: OwnerDish) {
    const optimistic = dishes.map((x) =>
      x._id === d._id ? { ...x, isAvailable: !x.isAvailable } : x,
    );
    setDishes(optimistic);
    try {
      await updateDish(d._id, { isAvailable: !d.isAvailable });
    } catch (err) {
      await refresh();
      setError(toApiError(err).message);
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
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Menu</h1>
          <p className="text-sm text-ink-muted">
            {dishes.length} {dishes.length === 1 ? "dish" : "dishes"} on your menu
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} />
          Add dish
        </button>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          {error}
        </div>
      )}

      {dishes.length === 0 ? (
        <div className="card p-10 text-center">
          <UtensilsCrossed className="mx-auto text-brand-500" size={32} />
          <h2 className="mt-4 font-display text-xl font-semibold">No dishes yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Add your signature dishes — customers will start ordering once you publish.
          </p>
          <button onClick={openAdd} className="btn-primary mt-5">
            <Plus size={16} /> Add your first dish
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-ink-muted">
                {category}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((d) => (
                  <DishCard
                    key={d._id}
                    dish={d}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleAvailable={handleToggleAvailable}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <DishFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

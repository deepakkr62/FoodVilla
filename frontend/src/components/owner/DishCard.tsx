import { Leaf, Pencil, Trash2 } from "lucide-react";
import type { OwnerDish } from "@/lib/ownerApi";
import { cn } from "@/lib/cn";

export function DishCard({
  dish,
  onEdit,
  onDelete,
  onToggleAvailable,
}: {
  dish: OwnerDish;
  onEdit: (dish: OwnerDish) => void;
  onDelete: (dish: OwnerDish) => void;
  onToggleAvailable: (dish: OwnerDish) => void;
}) {
  return (
    <article
      className="card flex gap-4 p-4"
      data-testid={`dish-${dish._id}`}
      aria-label={`Dish ${dish.name}`}
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-brand-300">🍽️</div>
        )}
        <span
          className={cn(
            "absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded border border-white bg-white text-[10px]",
            dish.isVeg ? "text-green-600" : "text-red-600",
          )}
          aria-label={dish.isVeg ? "Vegetarian" : "Non-vegetarian"}
          title={dish.isVeg ? "Vegetarian" : "Non-vegetarian"}
        >
          {dish.isVeg ? <Leaf size={10} /> : "●"}
        </span>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-ink">{dish.name}</h3>
            <p className="text-xs uppercase tracking-wider text-ink-muted">{dish.category}</p>
          </div>
          <div className="text-right">
            <span className="font-display text-lg font-semibold text-ink">₹{dish.price}</span>
          </div>
        </div>
        {dish.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{dish.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={dish.isAvailable}
              onChange={() => onToggleAvailable(dish)}
              className="h-3.5 w-3.5 accent-brand-500"
            />
            Available
          </label>
          {dish.isPopular && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-dark">
              Popular
            </span>
          )}
          {dish.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted"
            >
              {t}
            </span>
          ))}
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              aria-label="Edit dish"
              onClick={() => onEdit(dish)}
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-cream-dark hover:text-brand-500"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              aria-label="Delete dish"
              onClick={() => onDelete(dish)}
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

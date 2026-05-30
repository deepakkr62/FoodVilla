import { Check, Clock } from "lucide-react";
import { STATUS_LABEL, STATUS_STEPS, type OrderStatus } from "@/lib/orderApi";
import { cn } from "@/lib/cn";

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        This order was cancelled.
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <ol className="grid grid-cols-5 gap-2">
      {STATUS_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s} className="flex flex-col items-center text-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                done
                  ? "border-brand-500 bg-brand-500 text-white"
                  : active
                    ? "border-brand-500 bg-white text-brand-600"
                    : "border-cream-dark bg-white text-ink-muted",
              )}
            >
              {done ? <Check size={16} /> : active ? <Clock size={16} /> : i + 1}
            </div>
            <span
              className={cn(
                "mt-1.5 text-[10px] font-medium uppercase tracking-wide",
                done || active ? "text-ink" : "text-ink-muted",
              )}
            >
              {STATUS_LABEL[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

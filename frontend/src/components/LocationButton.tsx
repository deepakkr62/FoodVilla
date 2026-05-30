"use client";

import { useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Coords {
  lat: number;
  lng: number;
}

export function LocationButton({
  coords,
  cityName,
  onSet,
  onClear,
}: {
  coords?: Coords;
  /** Optional resolved city to display alongside "Near you". */
  cityName?: string;
  onSet: (coords: Coords) => void;
  onClear: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function request() {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported by this browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onSet({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — filter by city instead"
            : "Could not get your location",
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }

  if (coords) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
        <MapPin size={14} />
        <span>
          Near you
          {cityName && (
            <span className="ml-1.5 text-xs font-normal text-brand-600/80">
              · {cityName}
            </span>
          )}
        </span>
        <button
          type="button"
          aria-label="Clear location"
          onClick={onClear}
          className="rounded-md p-0.5 hover:bg-brand-100"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={request}
        disabled={loading}
        className={cn("btn-ghost border border-cream-dark", loading && "opacity-60")}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
        {loading ? "Locating..." : "Near me"}
      </button>
      {error && <p className="text-xs text-ink-muted">{error}</p>}
    </div>
  );
}

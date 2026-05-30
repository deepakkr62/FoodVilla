"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({
  initialValue = "",
  onSubmit,
  placeholder = "Search restaurants, cuisines, dishes...",
}: {
  initialValue?: string;
  onSubmit: (q: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState(initialValue);

  useEffect(() => {
    setQ(initialValue);
  }, [initialValue]);

  // Debounced submit
  useEffect(() => {
    const t = setTimeout(() => onSubmit(q.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search restaurants"
        className="input h-12 pl-11 text-base"
      />
    </div>
  );
}

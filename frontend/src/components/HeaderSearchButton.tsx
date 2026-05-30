"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchOverlay } from "./SearchOverlay";

export function HeaderSearchButton() {
  const [open, setOpen] = useState(false);

  // Global hotkey: ⌘K / Ctrl+K opens search.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Search Food Villa (Ctrl+K)"
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-ink-soft transition-colors hover:bg-cream-dark hover:text-brand-500"
      >
        <Search size={18} />
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}

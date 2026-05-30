"use client";

import { useState } from "react";

/**
 * Avatar that tries to load `/dev-photo.jpg` from the public folder. If the
 * file is missing it gracefully falls back to a gradient circle with an
 * initial. Drop your photo at `frontend/public/dev-photo.jpg` to use it.
 */
export function DeveloperAvatar({
  size = 160,
  alt = "Deepak Kumar",
}: {
  size?: number;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="relative overflow-hidden rounded-full ring-4 ring-white shadow-warm"
      style={{ width: size, height: size }}
      aria-hidden={failed}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/dev-photo.jpg"
          alt={alt}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 font-display text-5xl font-semibold text-white">
          D
        </div>
      )}
    </div>
  );
}

/**
 * Tiny in-memory cache with TTL. Used to absorb the latency of repeat
 * Atlas round-trips on hot read endpoints like `/api/restaurants`.
 *
 * Not a substitute for Redis in production, but a perfect fit for v1.
 */
interface Entry<V> {
  value: V;
  expiresAt: number;
}

export class MemoryCache<V> {
  private store = new Map<string, Entry<V>>();
  constructor(private defaultTtlMs: number) {}

  get(key: string): V | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return e.value;
  }

  set(key: string, value: V, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(predicate: (key: string) => boolean): void {
    for (const k of this.store.keys()) {
      if (predicate(k)) this.store.delete(k);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const restaurantsCache = new MemoryCache<unknown>(30_000); // 30s TTL

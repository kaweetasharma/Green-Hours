// A TTL cache over sessionStorage. Only JSON-safe values go in, so the raw
// API response is cached and Dates are revived downstream by the parser.

interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
}

/** sessionStorage is absent in some SSR/test contexts, so degrade gracefully. */
const storage = (): Storage | null => {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
};

export const readCache = <T>(
  key: string,
  ttlMs: number,
  now: number = Date.now(),
): { value: T; fetchedAt: Date } | null => {
  const raw = storage()?.getItem(key);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (now - entry.fetchedAt > ttlMs) return null;
    return { value: entry.value, fetchedAt: new Date(entry.fetchedAt) };
  } catch {
    return null; // Corrupt entry, treat as a miss.
  }
};

export const writeCache = <T>(
  key: string,
  value: T,
  now: number = Date.now(),
): void => {
  const entry: CacheEntry<T> = { value, fetchedAt: now };
  try {
    storage()?.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota errors etc. are non-fatal. A cache miss next time is acceptable.
  }
};

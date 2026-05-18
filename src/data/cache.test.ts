import { describe, it, expect, beforeEach } from "vitest";
import { readCache, writeCache } from "./cache";

const KEY = "test:key";
const TTL = 30 * 60_000;

describe("cache", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns null on a miss", () => {
    expect(readCache(KEY, TTL)).toBeNull();
  });

  it("round-trips a value within its TTL", () => {
    const t0 = 1_000_000;
    writeCache(KEY, { hello: "world" }, t0);

    const hit = readCache<{ hello: string }>(KEY, TTL, t0 + 60_000);
    expect(hit?.value).toEqual({ hello: "world" });
    expect(hit?.fetchedAt).toEqual(new Date(t0));
  });

  it("treats an entry older than the TTL as a miss", () => {
    const t0 = 1_000_000;
    writeCache(KEY, { hello: "world" }, t0);
    expect(readCache(KEY, TTL, t0 + TTL + 1)).toBeNull();
  });

  it("treats a corrupt entry as a miss", () => {
    sessionStorage.setItem(KEY, "not json");
    expect(readCache(KEY, TTL)).toBeNull();
  });
});

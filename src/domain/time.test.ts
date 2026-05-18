import { describe, it, expect } from "vitest";
import { formatUkTime, formatUkTimeWithDay, formatAge } from "./time";

describe("formatUkTime", () => {
  it("shows UTC time directly in winter (GMT)", () => {
    expect(formatUkTime(new Date("2026-01-15T00:00:00Z"))).toBe("00:00");
  });

  it("shifts UTC forward an hour in summer (BST)", () => {
    // The whole reason this helper exists: 00:00 UTC is 01:00 UK in summer.
    expect(formatUkTime(new Date("2026-07-15T00:00:00Z"))).toBe("01:00");
  });
});

describe("formatUkTimeWithDay", () => {
  it("prefixes the weekday", () => {
    expect(formatUkTimeWithDay(new Date("2026-05-16T00:30:00Z"))).toMatch(
      /^Sat 0[01]:30$/,
    );
  });
});

describe("formatAge", () => {
  const base = new Date("2026-05-16T12:00:00Z");

  it("reads 'just now' for very fresh data", () => {
    expect(formatAge(base, new Date("2026-05-16T12:00:20Z"))).toBe("just now");
  });

  it("reads minutes for recent data", () => {
    expect(formatAge(base, new Date("2026-05-16T12:12:00Z"))).toBe("12 min ago");
  });

  it("reads hours for older data", () => {
    expect(formatAge(base, new Date("2026-05-16T14:00:00Z"))).toBe("2 hr ago");
  });

  it("never reports negative age for a clock skew", () => {
    expect(formatAge(base, new Date("2026-05-16T11:59:00Z"))).toBe("just now");
  });
});

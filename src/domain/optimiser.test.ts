import { describe, it, expect } from "vitest";
import { findCleanestWindow } from "./optimiser";
import type { ForecastRecord } from "./types";

/**
 * Build a forecast from a list of intensities, one per 30-min slot.
 * Slot 0 starts at `start`. `actuals` optionally overrides the actual value.
 */
const buildForecast = (
  intensities: number[],
  start: Date,
  actuals: (number | null)[] = [],
): ForecastRecord[] =>
  intensities.map((forecast, i) => {
    const from = new Date(start.getTime() + i * 30 * 60_000);
    const to = new Date(from.getTime() + 30 * 60_000);
    return { from, to, forecast, actual: actuals[i] ?? null };
  });

const T0 = new Date("2026-05-16T00:00:00Z");

describe("findCleanestWindow", () => {
  it("returns no-data for an empty forecast", () => {
    expect(findCleanestWindow([], 1, T0)).toEqual({ status: "no-data" });
  });

  it("returns no-data for a non-positive run duration", () => {
    const forecast = buildForecast([100, 100], T0);
    expect(findCleanestWindow(forecast, 0, T0).status).toBe("no-data");
  });

  it("returns insufficient-forecast when the run is longer than the forecast", () => {
    // 2 slots = 1 hour of forecast, but the appliance needs 3 hours.
    const forecast = buildForecast([100, 200], T0);
    expect(findCleanestWindow(forecast, 3, T0)).toEqual({
      status: "insufficient-forecast",
    });
  });

  it("picks the cleanest single-slot window (happy path)", () => {
    // Slot 3 (300 ... wait, 50) is cleanest. Run for 30 min => 1 slot.
    const forecast = buildForecast([300, 250, 200, 50, 280], T0);
    const result = findCleanestWindow(forecast, 0.5, T0);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.avgIntensity).toBe(50);
    expect(result.runNowIntensity).toBe(300);
    expect(result.savingPct).toBe(83); // round((300-50)/300*100)
    expect(result.window.from).toEqual(forecast[3].from);
  });

  it("averages intensity over a multi-slot window (running sum)", () => {
    // Run = 1.5h => 3 slots. Cleanest 3-slot block is indices 3-5 (avg 60).
    const forecast = buildForecast(
      [300, 290, 280, 40, 60, 80, 270, 260],
      T0,
    );
    const result = findCleanestWindow(forecast, 1.5, T0);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.avgIntensity).toBe(60); // (40+60+80)/3
    expect(result.window.from).toEqual(forecast[3].from);
    expect(result.window.to).toEqual(forecast[5].to);
  });

  it("excludes windows that start in the past (straddling now)", () => {
    // now sits inside slot 2. Slot 0 is cleanest but already gone, so the
    // optimiser must ignore it and pick the cleanest *future* slot (slot 4).
    const forecast = buildForecast([10, 300, 290, 280, 20, 260], T0);
    const now = new Date(forecast[2].from.getTime() + 5 * 60_000);
    const result = findCleanestWindow(forecast, 0.5, now);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.window.from).toEqual(forecast[4].from);
  });

  it("reports run-now-best when now is already the cleanest window", () => {
    const forecast = buildForecast([50, 200, 250, 300], T0);
    const result = findCleanestWindow(forecast, 0.5, T0);
    expect(result).toEqual({ status: "run-now-best", runNowIntensity: 50 });
  });

  it("breaks ties in favour of the earliest window", () => {
    // Slots 1 and 3 are equally clean (100). Earliest (slot 1) must win.
    const forecast = buildForecast([300, 100, 280, 100, 290], T0);
    const result = findCleanestWindow(forecast, 0.5, T0);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.window.from).toEqual(forecast[1].from);
  });

  it("reports negligible-saving when waiting barely helps", () => {
    // Best window is only ~3% cleaner than now, not worth deferring.
    const forecast = buildForecast([100, 99, 98, 97], T0);
    const result = findCleanestWindow(forecast, 0.5, T0);
    expect(result).toEqual({ status: "negligible-saving", runNowIntensity: 100 });
  });

  it("prefers a settled actual value over the forecast for a slot", () => {
    // Slot 2 forecasts 300 but actually settled at 10, so it should win.
    const forecast = buildForecast(
      [300, 280, 300, 260],
      T0,
      [null, null, 10, null],
    );
    const result = findCleanestWindow(forecast, 0.5, T0);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.avgIntensity).toBe(10);
    expect(result.window.from).toEqual(forecast[2].from);
  });
});

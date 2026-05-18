// The optimiser, the core of the app: given a 48-hour forecast and a run
// duration, find the cleanest contiguous window to start an appliance.
//
// It slides a fixed-width window across the forecast and keeps a running sum,
// which is O(n). The naive "sum each window from scratch" version is O(n*k).

import type { ForecastRecord, Recommendation } from "./types";

const SLOT_HOURS = 0.5;

// Below this % reduction, deferring the load is not worth it.
const NEGLIGIBLE_SAVING_PCT = 5;

// Prefer the settled `actual` reading; fall back to the forecast for slots
// that have not happened yet.
const slotIntensity = (record: ForecastRecord): number =>
  record.actual ?? record.forecast;

// First slot whose end is still in the future. Returns forecast.length when
// every slot is already in the past.
const currentSlotIndex = (forecast: ForecastRecord[], now: Date): number => {
  const idx = forecast.findIndex((r) => r.to.getTime() > now.getTime());
  return idx === -1 ? forecast.length : idx;
};

// `now` is a parameter, not Date.now(), so the function stays pure and the
// tests can pin it.
export const findCleanestWindow = (
  forecast: ForecastRecord[],
  runHours: number,
  now: Date = new Date(),
): Recommendation => {
  if (forecast.length === 0 || runHours <= 0) return { status: "no-data" };

  const slots = Math.ceil(runHours / SLOT_HOURS);
  const startIdx = currentSlotIndex(forecast, now);

  // Not enough forecast left from "now" to cover a full run.
  if (startIdx + slots > forecast.length) return { status: "insufficient-forecast" };

  const intensities = forecast.map(slotIntensity);
  const windowSumAt = (i: number): number =>
    intensities.slice(i, i + slots).reduce((sum, v) => sum + v, 0);

  // The "run now" window is the comparison baseline. Same length as every
  // candidate, so the % saving is an apples-to-apples average comparison.
  const runNowSum = windowSumAt(startIdx);

  // Slide the window from "now" to the end, tracking the minimum sum.
  // `<` (not `<=`) on the comparison means an earlier window wins ties.
  let windowSum = runNowSum;
  let bestSum = windowSum;
  let bestIdx = startIdx;
  for (let i = startIdx + 1; i + slots <= forecast.length; i++) {
    windowSum += intensities[i + slots - 1] - intensities[i - 1];
    if (windowSum < bestSum) {
      bestSum = windowSum;
      bestIdx = i;
    }
  }

  const avgIntensity = bestSum / slots;
  const runNowIntensity = runNowSum / slots;

  if (bestIdx === startIdx) return { status: "run-now-best", runNowIntensity };

  const savingPct = Math.round(
    ((runNowIntensity - avgIntensity) / runNowIntensity) * 100,
  );

  if (savingPct < NEGLIGIBLE_SAVING_PCT) {
    return { status: "negligible-saving", runNowIntensity };
  }

  return {
    status: "ok",
    window: { from: forecast[bestIdx].from, to: forecast[bestIdx + slots - 1].to },
    avgIntensity,
    runNowIntensity,
    savingPct,
  };
};

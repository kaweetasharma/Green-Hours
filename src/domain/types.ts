// Band names match the strings the UK Carbon Intensity API returns.
export type IntensityIndex =
  | "very low"
  | "low"
  | "moderate"
  | "high"
  | "very high";

// One 30-minute slot. `actual` is the settled reading and is null for slots
// still in the future.
export interface ForecastRecord {
  from: Date;
  to: Date;
  forecast: number;
  actual: number | null;
}

export interface Appliance {
  id: string;
  name: string;
  defaultRunHours: number;
}

export interface RunWindow {
  from: Date;
  to: Date;
}

// The optimiser's output. A discriminated union so the UI has to handle
// every state and cannot read fields that do not apply.
export type Recommendation =
  | {
      status: "ok";
      window: RunWindow;
      avgIntensity: number;
      runNowIntensity: number;
      // Whole-number % reduction vs running now. Always > 0 for "ok".
      savingPct: number;
    }
  /** The cleanest window in the forecast is the one starting now. */
  | { status: "run-now-best"; runNowIntensity: number }
  /** Waiting saves a negligible amount, not worth deferring the load. */
  | { status: "negligible-saving"; runNowIntensity: number }
  /** The forecast is shorter than the requested run duration. */
  | { status: "insufficient-forecast" }
  /** No forecast data at all. */
  | { status: "no-data" };

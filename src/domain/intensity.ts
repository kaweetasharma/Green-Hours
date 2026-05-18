// Turns a raw gCO2/kWh reading into display values (band, colour, "% clean").
// The single place those mappings live, so no component hardcodes a colour
// or a threshold.

import type { IntensityIndex } from "./types";

// gCO2/kWh that counts as a fully high-carbon day. Used only to scale the
// "% clean" framing, it is not a real grid maximum.
const DIRTY_REFERENCE = 350;

export type IntensityColour = "green" | "amber" | "red";

export interface IntensityBand {
  index: IntensityIndex;
  label: string;
  colour: IntensityColour;
  cleanPct: number;
}

// Bands in descending order: classifyIntensity takes the first whose `min`
// the reading clears, so order matters.
const BANDS: ReadonlyArray<{
  min: number;
  index: IntensityIndex;
  colour: IntensityColour;
}> = [
  { min: 300, index: "very high", colour: "red" },
  { min: 210, index: "high", colour: "red" },
  { min: 122, index: "moderate", colour: "amber" },
  { min: 50, index: "low", colour: "green" },
  { min: 0, index: "very low", colour: "green" },
];

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

export const toCleanPct = (gCO2perKWh: number): number =>
  clamp(Math.round(100 - (gCO2perKWh / DIRTY_REFERENCE) * 100), 0, 100);

export const classifyIntensity = (gCO2perKWh: number): IntensityBand => {
  const band = BANDS.find(({ min }) => gCO2perKWh >= min) ?? BANDS[BANDS.length - 1];
  return {
    index: band.index,
    label: band.index.toUpperCase(),
    colour: band.colour,
    cleanPct: toCleanPct(gCO2perKWh),
  };
};

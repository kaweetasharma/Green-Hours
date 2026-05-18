import type { Appliance } from "./types";

export const APPLIANCES: readonly Appliance[] = [
  { id: "dishwasher", name: "Dishwasher", defaultRunHours: 2 },
  { id: "washing-machine", name: "Washing machine", defaultRunHours: 1.5 },
  { id: "tumble-dryer", name: "Tumble dryer", defaultRunHours: 1.5 },
  { id: "ev-charge", name: "EV charge", defaultRunHours: 6 },
  { id: "immersion-heater", name: "Immersion heater", defaultRunHours: 1 },
];

// Hours.
export const RUN_DURATIONS: readonly number[] = [0.5, 1, 1.5, 2, 3, 4, 6, 8];

export const formatDuration = (hours: number): string => {
  if (hours < 1) return "30 min";
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${Math.floor(hours)}h 30m`;
};

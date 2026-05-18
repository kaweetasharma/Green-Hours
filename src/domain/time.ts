// Time formatting at the UI edge. The API returns UTC and the UK runs on BST
// half the year, so every displayed time is formatted in Europe/London,
// otherwise "01:00" would be off by an hour all summer.

const UK = "Europe/London";

const MINUTE_MS = 60_000;

export const formatUkTime = (date: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: UK,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

export const formatUkTimeWithDay = (date: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: UK,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

export const formatAge = (fetchedAt: Date, now: Date = new Date()): string => {
  const mins = Math.max(0, Math.round((now.getTime() - fetchedAt.getTime()) / MINUTE_MS));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)} hr ago`;
};

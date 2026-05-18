// UK Carbon Intensity API client. Endpoint: GET /intensity/{from}/fw48h
// (free, no auth). Docs: https://carbonintensity.org.uk/
//
// parseForecast is kept separate from fetchForecast so it can be tested
// against a recorded fixture without touching the network.

import type { ForecastRecord } from "../domain/types";
import { readCache, writeCache } from "./cache";

const BASE_URL = "https://api.carbonintensity.org.uk";

const CACHE_KEY = "grid-window:forecast";

// The API itself only refreshes every 30 min, so there is no point caching
// for any longer or shorter.
export const CACHE_TTL_MS = 30 * 60_000;

interface ApiSlot {
  from: string;
  to: string;
  intensity: {
    forecast: number | null;
    actual: number | null;
  };
}

interface ApiResponse {
  data: ApiSlot[];
}

export class ForecastParseError extends Error {}

const isApiResponse = (json: unknown): json is ApiResponse =>
  typeof json === "object" &&
  json !== null &&
  Array.isArray((json as ApiResponse).data);

export const parseForecast = (json: unknown): ForecastRecord[] => {
  if (!isApiResponse(json)) {
    throw new ForecastParseError("Malformed forecast response: missing data array");
  }

  return json.data.map((slot, i): ForecastRecord => {
    if (slot.intensity?.forecast == null) {
      throw new ForecastParseError(`Slot ${i} has no forecast value`);
    }
    return {
      from: new Date(slot.from),
      to: new Date(slot.to),
      forecast: slot.intensity.forecast,
      actual: slot.intensity.actual,
    };
  });
};

export interface ForecastResult {
  forecast: ForecastRecord[];
  fetchedAt: Date;
}

// `now` and `fetchFn` are injected so the function can be tested without a
// real clock or network.
export const fetchForecast = async (
  now: Date = new Date(),
  fetchFn: typeof fetch = fetch,
): Promise<ForecastResult> => {
  const cached = readCache<ApiResponse>(CACHE_KEY, CACHE_TTL_MS, now.getTime());
  if (cached) {
    return { forecast: parseForecast(cached.value), fetchedAt: cached.fetchedAt };
  }

  const from = now.toISOString();
  const response = await fetchFn(`${BASE_URL}/intensity/${from}/fw48h`);
  if (!response.ok) {
    throw new ForecastParseError(`Grid API responded ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse;
  const forecast = parseForecast(json); // Validate before caching.
  writeCache(CACHE_KEY, json, now.getTime());

  return { forecast, fetchedAt: now };
};

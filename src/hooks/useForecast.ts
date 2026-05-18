import { useCallback, useEffect, useState } from "react";
import type { ForecastRecord } from "../domain/types";
import { fetchForecast } from "../data/carbonApi";

// Two missed 30-min refresh cycles. Past this the data is reported as stale
// and the recommendation is withheld, since a stale answer is worse than none.
const STALE_AFTER_MS = 60 * 60_000;

export type ForecastState =
  | { status: "loading" }
  | { status: "ready"; forecast: ForecastRecord[]; fetchedAt: Date }
  | { status: "stale"; forecast: ForecastRecord[]; fetchedAt: Date }
  | { status: "error"; message: string };

export interface UseForecast {
  state: ForecastState;
  refresh: () => void;
}

export const useForecast = (): UseForecast => {
  const [state, setState] = useState<ForecastState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { forecast, fetchedAt } = await fetchForecast();
      const isStale = Date.now() - fetchedAt.getTime() > STALE_AFTER_MS;
      setState({
        status: isStale ? "stale" : "ready",
        forecast,
        fetchedAt,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't reach the grid data.";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, refresh: () => void load() };
};

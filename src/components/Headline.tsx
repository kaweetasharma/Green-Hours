import type { ForecastRecord } from "../domain/types";
import { classifyIntensity } from "../domain/intensity";
import { formatAge } from "../domain/time";
import { StatusBadge } from "./StatusBadge";

interface HeadlineProps {
  forecast: ForecastRecord[];
  fetchedAt: Date;
  stale?: boolean;
}

const currentSlot = (forecast: ForecastRecord[]): ForecastRecord | undefined => {
  const now = Date.now();
  return forecast.find((r) => r.to.getTime() > now) ?? forecast[0];
};

export const Headline = ({ forecast, fetchedAt, stale = false }: HeadlineProps) => {
  const slot = currentSlot(forecast);
  if (!slot) return null;

  const intensity = slot.actual ?? slot.forecast;
  const band = classifyIntensity(intensity);

  return (
    <section className="headline" aria-labelledby="headline-title">
      <p className="headline__eyebrow" id="headline-title">
        Right now
      </p>
      <div className="headline__row">
        <p className="headline__statement">
          The grid is <strong>{band.cleanPct}% clean</strong>
        </p>
        <StatusBadge colour={band.colour} label={band.label} />
      </div>
      <p className="headline__sub">
        {intensity} gCO₂/kWh · updated {formatAge(fetchedAt)}
        {stale && " · data may be out of date"}
      </p>
    </section>
  );
};

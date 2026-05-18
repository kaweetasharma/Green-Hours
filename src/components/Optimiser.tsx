import type { Appliance, Recommendation } from "../domain/types";
import { APPLIANCES, RUN_DURATIONS, formatDuration } from "../domain/appliances";
import { formatUkTimeWithDay } from "../domain/time";

interface OptimiserProps {
  appliance: Appliance;
  runHours: number;
  recommendation: Recommendation;
  onSelectAppliance: (id: string) => void;
  onSelectRunHours: (hours: number) => void;
}

const RecommendationCard = ({
  recommendation,
  applianceName,
}: {
  recommendation: Recommendation;
  applianceName: string;
}) => {
  const appliance = applianceName.toLowerCase();

  switch (recommendation.status) {
    case "ok":
      return (
        <div className="reco reco--ok">
          <p className="reco__headline">
            Start your {appliance} at{" "}
            <strong>{formatUkTimeWithDay(recommendation.window.from)}</strong>
          </p>
          <p className="reco__detail">
            That's <strong>{recommendation.savingPct}% less CO₂</strong> than
            running it now.
          </p>
        </div>
      );
    case "run-now-best":
      return (
        <div className="reco reco--ok">
          <p className="reco__headline">Now is a good time.</p>
          <p className="reco__detail">
            The next 48 hours hold no cleaner window, so go ahead and run your{" "}
            {appliance}.
          </p>
        </div>
      );
    case "negligible-saving":
      return (
        <div className="reco reco--muted">
          <p className="reco__headline">No meaningful saving by waiting.</p>
          <p className="reco__detail">
            The grid stays roughly this clean across the forecast, so run your{" "}
            {appliance} whenever suits you.
          </p>
        </div>
      );
    case "insufficient-forecast":
      return (
        <div className="reco reco--muted">
          <p className="reco__headline">Not enough forecast.</p>
          <p className="reco__detail">
            This run is longer than the remaining forecast. Try a shorter
            duration.
          </p>
        </div>
      );
    case "no-data":
      return (
        <div className="reco reco--muted">
          <p className="reco__headline">No forecast available.</p>
          <p className="reco__detail">
            Carbon-intensity data is unavailable right now.
          </p>
        </div>
      );
  }
};

export const Optimiser = ({
  appliance,
  runHours,
  recommendation,
  onSelectAppliance,
  onSelectRunHours,
}: OptimiserProps) => (
  <section className="optimiser" aria-labelledby="optimiser-title">
    <p className="optimiser__eyebrow" id="optimiser-title">
      Find the cleanest time
    </p>

    <div className="optimiser__controls">
      <label className="field">
        <span className="field__label">Appliance</span>
        <select
          value={appliance.id}
          onChange={(e) => onSelectAppliance(e.target.value)}
        >
          {APPLIANCES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Runs for</span>
        <select
          value={runHours}
          onChange={(e) => onSelectRunHours(Number(e.target.value))}
        >
          {RUN_DURATIONS.map((h) => (
            <option key={h} value={h}>
              {formatDuration(h)}
            </option>
          ))}
        </select>
      </label>
    </div>

    <RecommendationCard
      recommendation={recommendation}
      applianceName={appliance.name}
    />
  </section>
);

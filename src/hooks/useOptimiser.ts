// Owns the appliance/duration selection and derives the recommendation. Kept
// as a hook (not state inside Optimiser) so ForecastChart can shade the same
// chosen window from one source of truth.

import { useMemo, useState } from "react";
import type { ForecastRecord } from "../domain/types";
import { findCleanestWindow } from "../domain/optimiser";
import { APPLIANCES } from "../domain/appliances";

export const useOptimiser = (forecast: ForecastRecord[]) => {
  const [applianceId, setApplianceId] = useState(APPLIANCES[0].id);
  const [runHours, setRunHours] = useState(APPLIANCES[0].defaultRunHours);

  const appliance =
    APPLIANCES.find((a) => a.id === applianceId) ?? APPLIANCES[0];

  // Switching appliance resets the duration to that appliance's default.
  const selectAppliance = (id: string) => {
    const next = APPLIANCES.find((a) => a.id === id) ?? APPLIANCES[0];
    setApplianceId(next.id);
    setRunHours(next.defaultRunHours);
  };

  const recommendation = useMemo(
    () => findCleanestWindow(forecast, runHours),
    [forecast, runHours],
  );

  return {
    appliance,
    runHours,
    recommendation,
    selectAppliance,
    setRunHours,
  };
};

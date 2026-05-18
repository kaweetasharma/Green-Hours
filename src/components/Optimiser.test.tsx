import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Optimiser } from "./Optimiser";
import { APPLIANCES } from "../domain/appliances";
import type { Recommendation } from "../domain/types";

const noop = () => {};

const renderWith = (recommendation: Recommendation, onSelectRunHours = noop) =>
  render(
    <Optimiser
      appliance={APPLIANCES[0]}
      runHours={2}
      recommendation={recommendation}
      onSelectAppliance={noop}
      onSelectRunHours={onSelectRunHours}
    />,
  );

describe("Optimiser", () => {
  it("renders the recommendation sentence for an 'ok' result", () => {
    const recommendation: Recommendation = {
      status: "ok",
      window: { from: new Date("2026-05-16T00:00:00Z"), to: new Date("2026-05-16T02:00:00Z") },
      avgIntensity: 80,
      runNowIntensity: 200,
      savingPct: 38,
    };
    renderWith(recommendation);
    expect(screen.getByText(/start your dishwasher at/i)).toBeInTheDocument();
    expect(screen.getByText(/38% less co₂/i)).toBeInTheDocument();
  });

  it("renders the muted card for insufficient forecast", () => {
    renderWith({ status: "insufficient-forecast" });
    expect(screen.getByText(/not enough forecast/i)).toBeInTheDocument();
  });

  it("emits the chosen duration when changed", async () => {
    const onSelectRunHours = vi.fn();
    renderWith({ status: "no-data" }, onSelectRunHours);
    await userEvent.selectOptions(screen.getByLabelText(/runs for/i), "3");
    expect(onSelectRunHours).toHaveBeenCalledWith(3);
  });
});

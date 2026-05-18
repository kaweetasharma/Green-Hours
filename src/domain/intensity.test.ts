import { describe, it, expect } from "vitest";
import { classifyIntensity, toCleanPct } from "./intensity";

describe("toCleanPct", () => {
  it("maps a zero-carbon grid to 100% clean", () => {
    expect(toCleanPct(0)).toBe(100);
  });

  it("maps the dirty reference (350) to 0% clean", () => {
    expect(toCleanPct(350)).toBe(0);
  });

  it("clamps readings above the dirty reference to 0", () => {
    expect(toCleanPct(500)).toBe(0);
  });

  it("rounds intermediate readings", () => {
    // 175 / 350 = 50% dirty => 50% clean
    expect(toCleanPct(175)).toBe(50);
  });
});

describe("classifyIntensity", () => {
  it("classifies a very low reading as green", () => {
    const band = classifyIntensity(20);
    expect(band.index).toBe("very low");
    expect(band.colour).toBe("green");
    expect(band.label).toBe("VERY LOW");
  });

  it("classifies a moderate reading as amber", () => {
    expect(classifyIntensity(150).colour).toBe("amber");
    expect(classifyIntensity(150).index).toBe("moderate");
  });

  it("classifies a high reading as red", () => {
    expect(classifyIntensity(250).colour).toBe("red");
  });

  it("classifies a very high reading as red", () => {
    expect(classifyIntensity(400).index).toBe("very high");
  });

  it("treats band thresholds as inclusive lower bounds", () => {
    // 122 is the first 'moderate' value; 121 is still 'low'.
    expect(classifyIntensity(122).index).toBe("moderate");
    expect(classifyIntensity(121).index).toBe("low");
  });

  it("carries the clean % alongside the band", () => {
    expect(classifyIntensity(0).cleanPct).toBe(100);
  });
});

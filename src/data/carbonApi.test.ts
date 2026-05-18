import { describe, it, expect, beforeEach } from "vitest";
import { parseForecast, fetchForecast, ForecastParseError } from "./carbonApi";
import fixture from "./__fixtures__/forecast.json";

describe("parseForecast", () => {
  it("revives a recorded API response into typed forecast records", () => {
    const records = parseForecast(fixture);
    expect(records).toHaveLength(4);

    const first = records[0];
    expect(first.from).toBeInstanceOf(Date);
    expect(first.from.toISOString()).toBe("2026-05-16T00:00:00.000Z");
    expect(first.forecast).toBe(266);
    expect(first.actual).toBe(271);
  });

  it("keeps a null actual for future slots", () => {
    const records = parseForecast(fixture);
    expect(records[2].actual).toBeNull();
  });

  it("throws on a response with no data array", () => {
    expect(() => parseForecast({ foo: "bar" })).toThrow(ForecastParseError);
  });

  it("throws on null input", () => {
    expect(() => parseForecast(null)).toThrow(ForecastParseError);
  });

  it("throws when a slot is missing its forecast value", () => {
    const broken = { data: [{ from: "x", to: "y", intensity: { actual: 100 } }] };
    expect(() => parseForecast(broken)).toThrow(ForecastParseError);
  });
});

describe("fetchForecast", () => {
  const now = new Date("2026-05-16T00:00:00Z");

  beforeEach(() => sessionStorage.clear());

  it("fetches, parses, and reports the response from the network", async () => {
    const fetchFn = (async () =>
      new Response(JSON.stringify(fixture), { status: 200 })) as typeof fetch;

    const result = await fetchForecast(now, fetchFn);
    expect(result.forecast).toHaveLength(4);
    expect(result.fetchedAt).toEqual(now);
  });

  it("throws when the API responds with an error status", async () => {
    const fetchFn = (async () => new Response("", { status: 503 })) as typeof fetch;
    await expect(fetchForecast(now, fetchFn)).rejects.toThrow(ForecastParseError);
  });
});

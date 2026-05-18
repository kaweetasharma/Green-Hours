import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastRecord, Recommendation } from "../domain/types";
import { formatUkTime } from "../domain/time";

interface ForecastChartProps {
  forecast: ForecastRecord[];
  recommendation: Recommendation;
}

interface ChartPoint {
  // Epoch ms, so the X axis can be a real time scale rather than evenly
  // spaced categories.
  t: number;
  intensity: number;
}

const toPoint = (record: ForecastRecord): ChartPoint => ({
  t: record.from.getTime(),
  intensity: record.actual ?? record.forecast,
});

export const ForecastChart = ({ forecast, recommendation }: ForecastChartProps) => {
  const data = forecast.map(toPoint);
  const now = Date.now();
  const window = recommendation.status === "ok" ? recommendation.window : null;

  return (
    <section className="chart" aria-labelledby="chart-title">
      <p className="chart__eyebrow" id="chart-title">
        Next 48 hours
      </p>

      <div className="chart__canvas">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="intensityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f9e6e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2f9e6e" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickFormatter={(t: number) => formatUkTime(new Date(t))}
              minTickGap={48}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              width={48}
              label={{ value: "gCO₂", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(t) => formatUkTime(new Date(Number(t)))}
              formatter={(value: number) => [`${value} gCO₂/kWh`, "Intensity"]}
            />

            {window && (
              <ReferenceArea
                x1={window.from.getTime()}
                x2={window.to.getTime()}
                fill="#2f9e6e"
                fillOpacity={0.18}
                ifOverflow="extendDomain"
              />
            )}
            <ReferenceLine
              x={now}
              stroke="#888"
              strokeDasharray="4 4"
              label={{ value: "now", fontSize: 11, fill: "#888", position: "insideTopRight" }}
            />

            <Area
              type="monotone"
              dataKey="intensity"
              stroke="#2f9e6e"
              strokeWidth={2}
              fill="url(#intensityFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="chart__legend">
        Shaded band = recommended window. Lower is cleaner.
      </p>
    </section>
  );
};

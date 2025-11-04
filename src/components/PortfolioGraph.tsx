import React, { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { ChartData } from "../types";
import { fetchPortfolioHistory } from "../data/cacheData";

interface PortfolioGraphProps { timeframe: string; }

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ timeframe }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const is1D = timeframe === "1D";
  //NOT A TRUE GRAPH REFLECTING BUYS, FIX TO SHOW SPIKE TRENDS
  //INCLUDE VOLATILITY TOO
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await fetchPortfolioHistory(timeframe);
        const transformed: ChartData[] = history.map((item: any) => ({
          timestamp: Number(item.timestamp) || new Date(item.date).getTime(),
          date: item.date,
          value: item.value,
        }));
        setChartData(transformed);
      } catch (e) {
        console.error("Failed to load portfolio history:", e);
        setError("Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [timeframe]);

  function buildIntradayEtTicks(rows: { timestamp?: number }[]) {
    if (!rows?.length) return [];
    const want = ["09:30","10:30","11:30","12:30","13:30","14:30","15:30","16:00"];
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const labelToTs = new Map<string, number>();
    for (const p of rows) {
      if (!p.timestamp) continue;
      const parts = fmt.formatToParts(p.timestamp);
      const hh = parts.find(x => x.type === "hour")!.value.padStart(2, "0");
      const mm = parts.find(x => x.type === "minute")!.value.padStart(2, "0");
      const label = `${hh}:${mm}`;
      if (!labelToTs.has(label)) labelToTs.set(label, p.timestamp);
    }
    return want.filter(l => labelToTs.has(l)).map(l => labelToTs.get(l)!);
  }

  if (loading) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="alert alert-danger" role="alert">{error}</div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="alert alert-info" role="alert">No portfolio data available</div>
        </div>
      </div>
    );
  }

  const intradayTicks = is1D ? buildIntradayEtTicks(chartData) : undefined;
  const categoryTicks =
    !is1D && chartData.length
      ? Array.from(new Set([chartData[0]?.date, chartData[chartData.length - 1]?.date].filter(Boolean)))
      : undefined;

  return (
    <div className="card chart-card mb-4">
      <div className="card-body p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#495057" opacity={0.3} />

            <XAxis
              dataKey={is1D ? "timestamp" : "date"}
              type={is1D ? "number" : "category"}
              scale={is1D ? "time" : undefined}
              domain={is1D ? ["dataMin", "dataMax"] : undefined}
              ticks={is1D ? intradayTicks : categoryTicks}
              allowDuplicatedCategory={false}
              stroke="#6c757d"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#6c757d" }}
              tickFormatter={(val: number | string) =>
                is1D
                  ? new Date(val as number).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                  : (val as string)
              }
            />

            <YAxis
              stroke="#6c757d"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#6c757d" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              contentStyle={{ backgroundColor: "#212529", border: "1px solid #495057", borderRadius: 8, color: "#fff" }}
              labelFormatter={(label: number | string) =>
                is1D
                  ? new Date(label as number).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                  : (label as string)
              }
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Portfolio Value"]}
            />

            <Area type="monotone" dataKey="value" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { ChartData } from "../types";
import { fetchBenchmarkData, fetchPortfolioHistory } from "../data/cacheData";
import { usePortfolio } from "../context/PortfolioContext";
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface PortfolioGraphProps { timeframe: string; }

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ timeframe }) => {
  const { holdings} = usePortfolio();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

 const [showSPY, setShowSPY] = useState<boolean>(() =>
  JSON.parse(localStorage.getItem("cmp_spy") ?? "false")
  );
  const [showQQQ, setShowQQQ] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("cmp_qqq") ?? "false")
  );
  const [showDIA, setShowDIA] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("cmp_dia") ?? "false")
  );

  useEffect(() => { localStorage.setItem("cmp_spy", JSON.stringify(showSPY)); }, [showSPY]);
  useEffect(() => { localStorage.setItem("cmp_qqq", JSON.stringify(showQQQ)); }, [showQQQ]);
  useEffect(() => { localStorage.setItem("cmp_dia", JSON.stringify(showDIA)); }, [showDIA]);

  const [bench, setBench] = useState<Record<string, {timestamp:number; value:number}[]>>({});


  const toMs = (t:number) => (t > 1e12 ? t : t * 1000);

  const isRegularSessionET = (ts:number) => {
    const d = new Date(ts);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const hh = Number(parts.find(p => p.type === "hour")!.value);
    const mm = Number(parts.find(p => p.type === "minute")!.value);
    const minutes = hh * 60 + mm;
    return minutes >= 570 && minutes <= 960; // 09:30 (570) to 16:00 (960)
  };

  const yDomain = React.useMemo(() => {
  if (!chartData.length) return [0, 0];
  let min = Infinity, max = -Infinity;
  for (const d of chartData) {
    const v = Number(d.value) || 0;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!isFinite(min) || !isFinite(max) || min === max) {
    return [min || 0, (max || 0) + 1];
  }
  const pad = (max - min) * 0.06;
  return [min - pad, max + pad];
}, [chartData]);

const [yMin, yMax] = yDomain;
  useEffect(() => {
    const want = [
      showSPY ? "SPY" : null,
      showQQQ ? "QQQ" : null,
      showDIA ? "DIA" : null,
    ].filter(Boolean) as string[];

    if (!want.length) {
      setBench({});
      return;
    }
    const load = async () => {
      try {
        const res = await fetchBenchmarkData(timeframe, want.join(","));    
        const wantedTs = new Set(chartData.map(p => p.timestamp));

        const cleaned: Record<string, {timestamp:number; value:number}[]> = {};
        for (const [sym, arr] of Object.entries(res)) {
          cleaned[sym] = (arr ?? [])
            .map(p => ({ timestamp: toMs(Number(p.timestamp)), value: Number(p.value) }))
            .filter(p => isRegularSessionET(p.timestamp))               // regular hours only
            .filter(p => wantedTs.has(p.timestamp));                    // align to your X-axis points
        }
        setBench(cleaned);
      } catch (e) {
        console.error("Failed to load benchmark data:", e);
        setBench({});
      }
    };
  load();
  }, [timeframe, showSPY, showQQQ, showDIA,chartData]);
  const is1D = timeframe === "1D";
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await fetchPortfolioHistory(timeframe);
        const transformed: ChartData[] = history
          .map((item:any) => ({
            timestamp: toMs(Number(item.timestamp) || Date.parse(item.date)),
            date: item.date,
            value: Number(item.value),
          }))
          .filter(p => timeframe === "1D" ? isRegularSessionET(p.timestamp) : true);

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

  const mergedData = React.useMemo(() => {
    if (!chartData.length) return [];
    const maps: Record<string, Map<number, number>> = {};
    for (const [sym, arr] of Object.entries(bench)) {
      const m = new Map<number, number>();
      for (const p of arr ?? []) m.set(Number(p.timestamp), Number(p.value));
      maps[sym] = m;
    }
    return chartData.map(p => ({
      ...p,
      ...(maps.SPY ? { SPY: maps.SPY.get(p.timestamp) } : {}),
      ...(maps.QQQ ? { QQQ: maps.QQQ.get(p.timestamp) } : {}),
      ...(maps.DIA ? { DIA: maps.DIA.get(p.timestamp) } : {}),
    }));
  }, [chartData, bench]);


  function buildIntradayEtTicks(rows: { timestamp: number }[]) {
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

  if (error && holdings.length >0) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="alert alert-danger" role="alert">{error}</div>
        </div>
      </div>
    );
  }

  if (!chartData.length || holdings.length === 0) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="alert alert-info" role="alert">No portfolio data available</div>
        </div>
      </div>
    );
  }

 const intradayTicks = is1D ? buildIntradayEtTicks(chartData) : undefined;
  const intradayDomain = React.useMemo<[number, number] | undefined>(() => {
  if (!is1D || !intradayTicks?.length) return undefined;
  return [intradayTicks[0], intradayTicks[intradayTicks.length - 1]];
}, [is1D, intradayTicks]);

  function getImprovedCategoryTicks(data: ChartData[]): string[] {
    if (!data.length) return [];
    const sorted = [...data].sort((a,b) => a.timestamp - b.timestamp);

    const total = sorted.length;
    const desired = timeframe === "5D" ? 5 : timeframe === "1M" ? 8 : 10;
    const step = Math.max(1, Math.floor(total / desired));

    const ticks: string[] = [];
    for (let i = 0; i < total; i += step) ticks.push(sorted[i].date);

    const lastDate = sorted[total - 1].date;
    if (ticks[ticks.length - 1] !== lastDate) ticks.push(lastDate);
    return ticks;
  }

  const improvedCategoryTicks = !is1D && chartData.length
    ? getImprovedCategoryTicks(chartData)
    : undefined;

  return (
    <div className="card chart-card mb-4">
     <div className="d-flex justify-content-between align-items-center p-3 ps-4">
      <div className="dropdown">
        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          Portfolio 1
        </button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item active">Portfolio 1</button></li>
          <li><button className="dropdown-item disabled">Portfolio 2</button></li>
          <li><button className="dropdown-item disabled">Create new…</button></li>
        </ul>
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="btn-group index-toggle-group" role="group" aria-label="Compare Indexes">
          <button
            type="button"
            aria-pressed={showSPY}
            className={`btn btn-sm index-btn spy ${showSPY ? "active" : ""}`}
            onClick={() => setShowSPY((v) => !v)}
          >
            S&amp;P 500
          </button>
          <button
            type="button"
            aria-pressed={showQQQ}
            className={`btn btn-sm index-btn qqq ${showQQQ ? "active" : ""}`}
            onClick={() => setShowQQQ((v) => !v)}
          >
            Nasdaq
          </button>
          <button
            type="button"
            aria-pressed={showDIA}
            className={`btn btn-sm index-btn dia ${showDIA ? "active" : ""}`}
            onClick={() => setShowDIA((v) => !v)}
          >
            Dow Jones
          </button>
        </div>
      </div>
    </div>

      <div className="card-body p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={mergedData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.05} />
              </linearGradient>
              
              <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#0d6efd" opacity="0.3" />
              </pattern>
            </defs>
            <XAxis
              dataKey={is1D ? "timestamp" : "date"}
              type={is1D ? "number" : "category"}
              scale={is1D ? "time" : undefined}
              domain={is1D ? intradayDomain : undefined}
              ticks={is1D ? intradayTicks : improvedCategoryTicks} // ← New function
              stroke="#6c757d"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#6c757d" }}
              angle={-45} 
              textAnchor="end"
              height={60}
              tickFormatter={(val) =>
                is1D
                  ? new Date(val as number).toLocaleTimeString("en-US", {
                      hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
                    })
                  : new Date(val as string).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
            />

            <YAxis
              yAxisId="left"
              domain={[yMin, yMax]}
              tick={{ fill: "#6c757d" }}
              stroke="#6c757d"
              style={{ fontSize: 12 }}
              tickFormatter={(v) => `$${v.toLocaleString(undefined,{ maximumFractionDigits: 0 })}`}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#6c757d" }}
              stroke="#6c757d"
              style={{ fontSize: 12 }}
              domain={["dataMin - 2", "dataMax + 2"]} // small headroom
              tickFormatter={(v) => `${v.toFixed(0)}%`}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#495057" opacity={0.3} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#212529",
                border: "1px solid #495057",
                borderRadius: 8,
                color: "#fff",
              }}
              labelFormatter={(label, payload) => {
                const ts = payload?.[0]?.payload?.timestamp ?? (typeof label === "number" ? label : undefined);
                if (!ts) return String(label);
                return new Date(ts).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/New_York",
                });
              }}
              formatter={(val: ValueType, name: NameType, ctx: Payload<ValueType, NameType>) => {
                const key = (ctx?.dataKey as string) ?? String(name);
                if (key === 'value') {
                  const formatted = `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  return [formatted, 'Portfolio'] as [React.ReactNode, React.ReactNode];
                }
                const formatted = `${Number(val).toFixed(2)}%`;
                return [formatted, String(name)] as [React.ReactNode, React.ReactNode];
              }}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="value"
              stroke="#4d9eff"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fillOpacity={1}
              fill="url(#dots)"
              dot={false}
              baseValue="dataMin"
            />
            {showSPY && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="SPY"  
                stroke="#d4e0eeff"
                strokeWidth={1.75}
                dot={false}
                connectNulls
                name="S&P 500"
              />
            )}

            {showQQQ && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="QQQ"
                stroke="#ffd28a"
                strokeWidth={1.75}
                dot={false}
                connectNulls
                name="Nasdaq"
              />
            )}

            {showDIA && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="DIA"
                stroke="#9fe3c1"
                strokeWidth={1.75}
                dot={false}
                connectNulls
                name="Dow Jones"
              />
            )}

          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

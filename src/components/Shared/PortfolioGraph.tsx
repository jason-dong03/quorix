import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { usePortfolio } from "../../context/PortfolioContext";
import { buildDailyTicksEt, formatEtDate, formatEtTime } from "../../utils/ETHelper";
import { ChartHeader } from "./ChartHeader";
import { useBenchmarkToggles } from "../../hooks/useBenchmarkToggles";
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { useBenchmarkData } from "../../hooks/useBenchmarkData";
import {
  calculateYDomain,
  calculateIntradayDomain,
  calculateMultiDayDomain,
  calculateRangeDomain,
} from "../../utils/chartHelpers";
import {
  createBenchmarkMaps,
  mergeBenchmarkData,
} from "../../utils/benchmarkHelpers";

interface PortfolioGraphProps {
  timeframe: string;
}

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ timeframe }) => {
  const { holdings } = usePortfolio();
  
  const {
    showSPY,
    showQQQ,
    showDIA,
    toggleSPY,
    toggleQQQ,
    toggleDIA,
    activeSymbols,
  } = useBenchmarkToggles();

  const { chartData, loading, error } = usePortfolioData(timeframe);


  const { benchmarkData } = useBenchmarkData(timeframe, activeSymbols);


  const is1D = timeframe === "1D";
  const is5D = timeframe === "5D";
  const is1M = timeframe === "1M";
  const xKey = is1D || is5D ? "timestamp" : "dayStart";


  const [yMin, yMax] = useMemo(() => calculateYDomain(chartData), [chartData]);

 
  const intradayDomain = useMemo(
    () => (is1D ? calculateIntradayDomain(chartData) : undefined),
    [is1D, chartData]
  );

  const multiDayDomain = useMemo(
    () => (is5D || is1M ? calculateMultiDayDomain(chartData, timeframe) : undefined),
    [is5D, is1M, chartData, timeframe]
  );

  const rangeDomain = useMemo(
    () => (is5D || is1M ? calculateRangeDomain(chartData, timeframe, xKey) : undefined),
    [is5D, is1M, chartData, timeframe, xKey]
  );

  // Calculate day ticks for daily view
  const dayTicks = useMemo(
    () => (xKey === "dayStart" && rangeDomain ? buildDailyTicksEt(rangeDomain) : undefined),
    [xKey, rangeDomain]
  );

  // Merge benchmark data with chart data
  const benchmarkMaps = useMemo(
    () => createBenchmarkMaps(benchmarkData, timeframe),
    [benchmarkData, timeframe]
  );

  const mergedData = useMemo(
    () => mergeBenchmarkData(chartData, benchmarkMaps, timeframe),
    [chartData, benchmarkMaps, timeframe]
  );

  const extendedData = useMemo(() => {
    if (!mergedData.length) return [];
    
    let result = [...mergedData];
    const last = result[result.length - 1];
    if (!last) return result;

    if (is1D && intradayDomain) {
      const rightEdge = intradayDomain[1];
      if (last.timestamp < rightEdge) {
        result.push({ ...last, timestamp: rightEdge });
      }
    } else if (is5D && multiDayDomain && xKey === "timestamp") {
      const rightEdge = multiDayDomain[1];
      if (last.timestamp < rightEdge) {
        result.push({ ...last, timestamp: rightEdge });
      }
    } else if (is1M && rangeDomain) {
      const rightEdge = rangeDomain[1];
      if (last.dayStart && last.dayStart < rightEdge) {
        result.push({ 
          ...last, 
          dayStart: rightEdge,
          timestamp: rightEdge 
        });
      }
    }

    return result;
  }, [mergedData, is1D, is5D, is1M, intradayDomain, multiDayDomain, rangeDomain, xKey]);
  const formatTooltipValue = (
    val: ValueType,
    name: NameType,
    ctx: Payload<ValueType, NameType>
  ) => {
    const key = (ctx?.dataKey as string) ?? String(name);
    
    if (key === "value") {
      const formatted = `$${Number(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      return [formatted, "Portfolio"] as [React.ReactNode, React.ReactNode];
    }
    
    const formatted = `${Number(val).toFixed(2)}%`;
    return [formatted, String(name)] as [React.ReactNode, React.ReactNode];
  };

  const formatTooltipLabel = (label: any, payload: any) => {
    const p = payload?.[0]?.payload as any;
    const ts = is1D ? p?.timestamp : p?.dayStart;
    
    if (!ts) return String(label);
    
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      month: "long",
      day: "numeric",
      year: "numeric",
      ...(is1D ? { hour: "numeric", minute: "2-digit" } : {}),
    }).format(ts);
  };

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


  if (error && holdings.length > 0) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length || holdings.length === 0) {
    return (
      <div className="card chart-card mb-4">
        <div className="card-body p-4">
          <div className="alert alert-info" role="alert">
            No portfolio data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card chart-card mb-4">
      <ChartHeader
        showSPY={showSPY}
        showQQQ={showQQQ}
        showDIA={showDIA}
        onToggleSPY={toggleSPY}
        onToggleQQQ={toggleQQQ}
        onToggleDIA={toggleDIA}
      />

      <div className="card-body p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={extendedData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.05} />
              </linearGradient>

              <pattern
                id="dots"
                x="0"
                y="0"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="#0d6efd" opacity="0.3" />
              </pattern>
            </defs>

            <XAxis
              dataKey={xKey}
              type="number"
              scale="time"
              domain={
                is1D
                  ? intradayDomain
                  : rangeDomain ?? ["dataMin", "dataMax"]
              }
              ticks={xKey === "dayStart" ? dayTicks : undefined}
              stroke="#6c757d"
              tick={{ fill: "#6c757d" }}
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(ms) =>
                is1D ? formatEtTime(ms as number) : formatEtDate(ms as number)
              }
            />

            <YAxis
              yAxisId="left"
              domain={[yMin, yMax]}
              tick={{ fill: "#6c757d" }}
              stroke="#6c757d"
              style={{ fontSize: 12 }}
              tickFormatter={(v) =>
                `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              }
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#6c757d" }}
              stroke="#6c757d"
              style={{ fontSize: 12 }}
              domain={["dataMin - 2", "dataMax + 2"]}
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
              labelFormatter={formatTooltipLabel}
              formatter={formatTooltipValue}
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
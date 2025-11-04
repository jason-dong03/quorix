import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartData } from "../types";
import { fetchPortfolioHistory } from "../data/cacheData";

interface PortfolioGraphProps {
  timeframe: string;
}

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({
  timeframe,
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('🔄 Effect triggered! Timeframe:', timeframe);
    const loadPortfolioHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await fetchPortfolioHistory(timeframe);
        const transformedData: ChartData[] = history.map((item) => ({
          date: item.date,
          value: item.value,
        }));

        setChartData(transformedData);
      } catch (err) {
        console.error("Failed to load portfolio history:", err);
        setError("Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioHistory();
  }, [timeframe]);

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
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
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

  // Determine if we should show fewer ticks for intraday data
  const isIntraday = chartData.length > 20;
  const tickInterval = isIntraday ? Math.floor(chartData.length / 8) : 0; // Show ~8 ticks for intraday

  return (
    <>
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
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#495057"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="#6c757d"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#6c757d" }}
                interval={tickInterval}
                angle={isIntraday ? -45 : 0}
                textAnchor={isIntraday ? "end" : "middle"}
                height={isIntraday ? 80 : 30}
              />
              <YAxis
                stroke="#6c757d"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#6c757d" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#212529",
                  border: "1px solid #495057",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Portfolio Value",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0d6efd"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
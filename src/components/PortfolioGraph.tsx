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

interface PortfolioGraphProps {
  timeframe: string;
}

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({
  timeframe,
}) => {
  const generateChartData = (days: number): ChartData[] => {
    const data: ChartData[] = [];
    const baseValue = 42195.4;
    let currentValue = baseValue;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const volatility = 0.012;
      const trend = 0.0006;
      const change = (Math.random() - 0.48) * volatility + trend;
      currentValue = currentValue * (1 + change);

      data.push({
        date:
          days === 1
            ? date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        value: Math.round(currentValue * 100) / 100,
      });
    }
    return data;
  };

  const [chartData, setChartData] = useState<ChartData[]>(generateChartData(1));

  useEffect(() => {
    const days = timeframe === "1D" ? 1 : timeframe === "5D" ? 5 : 30;
    setChartData(generateChartData(days));
  }, [timeframe]);
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

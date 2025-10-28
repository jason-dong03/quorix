import React, { useState } from "react";
import { TrendingUp, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { newsData, chartData } from "./data";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "holdings" | "history"
  >("overview");

  return (
    <div className="app-shell">
      {/* News grid */}
      <div className="row g-3 mb-4 mt-1 mx-auto">
        {newsData.map((news, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="news-card p-3">
              <div className="news-header-row">
                <span className="category-badge">{news.category}</span>
                <span className="news-time">🕐 {news.time}</span>
              </div>
              <div className="news-content">
                <h3 className="news-title">{news.title}</h3>
                <p className="news-desc mb-0">{news.desc}</p>
                <p className="news-source mb-0">{news.source}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex justify-content-start mb-4 ps-2">
        <div className="tab-card">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            ⊞ Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "holdings" ? "active" : ""}`}
            onClick={() => setActiveTab("holdings")}
          >
            📈 Holdings
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            🕐 History
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="main-grid">
        {/* Chart section */}
        <div className="chart-card">
          <div className="mb-4">
            <h2 className="section-title mb-1">Portfolio Performance</h2>
            <p className="section-subtitle">Historical value over time</p>
          </div>

          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    `$${(value / 1000).toFixed(0)}k`
                  }
                />

                <Tooltip
                  contentStyle={{}}
                  wrapperStyle={{ outline: "none" }}
                  cursor={{ stroke: "#3b82f6", strokeOpacity: 0.15 }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Value",
                  ]}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="chart-tooltip">
                          <div className="fw-semibold">{label}</div>
                          <div>
                            Value: $
                            {Number(
                              payload[0].value as number
                            ).toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats column */}
        <div className="stats-col">
          {/* Total Value */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Value</span>
              <DollarSign size={20} color="#3b82f6" />
            </div>
            <p className="stat-value mb-1">$42,605.80</p>
            <p className="stat-subtext">Current portfolio value</p>
          </div>

          {/* Total Cost */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Cost</span>
              <DollarSign size={20} color="#64748b" />
            </div>
            <p className="stat-value mb-1">$36,600.00</p>
            <p className="stat-subtext">Total invested</p>
          </div>

          {/* Gain / Loss */}
          <div className="stat-card gain-card">
            <div className="stat-header">
              <span className="stat-label">Total Gain/Loss</span>
              <TrendingUp size={20} color="#22c55e" />
            </div>
            <p className="stat-value gain-text mb-1">+$6,005.80</p>
            <p className="stat-subtext">Unrealized profit/loss</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

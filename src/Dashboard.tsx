import React, { useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Dashboard.css";
import type { ChartData, HoldingsTab } from "./types.ts";
import AINewsBar from "./components/AINewsBar.tsx";
import Navbar from "./components/NavBar.tsx";
import { PortfolioHeader } from "./components/PortfolioHeader.tsx";
import { PortfolioGraph } from "./components/PortfolioGraph.tsx";
import { PortfolioTabs } from "./components/PortfolioTabs.tsx";
import { PortfolioHoldingList } from "./components/PortfolioHoldingList.tsx";
import { PortfolioWatchlist } from "./components/PortfolioWatchlist.tsx";
import { PortfolioAddStockList } from "./components/PortfolioAddStockList.tsx";
import { TodaysPerformance } from "./components/TodaysPerformance.tsx";
import { PortfolioStats } from "./components/PortfolioStats.tsx";
import { Insights } from "./components/Insights.tsx";
import { QuickActions } from "./components/QuickActions.tsx";
import {
  useFetchHoldingsData,
  useFetchStockData,
  useFetchWatchlistData,
} from "./data/stockData.ts";

const AIPortfolioManager: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [holdingsTab, setHoldingsTab] = useState<HoldingsTab>("holdings");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const availableStocks = useFetchStockData();
  const watchlistStocks = useFetchWatchlistData();
  const holdingStocks = useFetchHoldingsData();
  useEffect(() => {}, [availableStocks, watchlistStocks, holdingStocks]);

  const filteredStocks = availableStocks
    .map((s) => ({
      symbol: s.symbol,
      name: s.name,
      last_price: s.last_price,
      last_change_pct: s.last_change_pct,
      last_updated: s.last_updated,
    }))
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

  const totalValue = 42195.4;
  const todayGain = 1247.83;
  const todayGainPercent = 3.05;

  return (
    <div className="portfolio-wrapper">
      <Navbar />
      <div className="container-fluid p-4">
        <AINewsBar />
        <div className="row g-4">
          {/* Body */}
          <div className="col-lg-9">
            <PortfolioHeader
              totalValue={totalValue}
              todayGain={todayGain}
              todayGainPercent={todayGainPercent}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
            {/* Graph */}
            <PortfolioGraph chartData={chartData} />

            {/* Holdings/Watchlist */}
            <div className="card holdings-card">
              <div className="card-body p-4">
                <PortfolioTabs
                  portfolio={holdingStocks}
                  watchlist={watchlistStocks}
                  holdingsTab={holdingsTab}
                  setHoldingsTab={setHoldingsTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredStocks={filteredStocks}
                />
                <div className="holdings-list">
                  {holdingsTab === "holdings" ? (
                    <PortfolioHoldingList portfolio={holdingStocks} />
                  ) : holdingsTab === "watchlist" ? (
                    <PortfolioWatchlist watchlist={watchlistStocks} />
                  ) : (
                    <PortfolioAddStockList filteredStocks={filteredStocks} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-lg-3">
            <TodaysPerformance
              totalValue={totalValue}
              todayGain={todayGain}
              todayGainPercent={todayGainPercent}
            />
            <PortfolioStats />
            <Insights />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPortfolioManager;

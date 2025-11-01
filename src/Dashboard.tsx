import React, { useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Dashboard.css";
import type { HoldingsTab, WatchlistStock } from "./types.ts";
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
  addStockToWatchlist,
  useFetchHoldingsData,
  useFetchStockData,
  useFetchWatchlistData,
} from "./data/stockData.ts";
import { useAuth } from "./auth/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import Modal from "./components/ BuyStockModal.tsx";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const [showAlert, setShowAlert] = useState(false);

  const handleSuccess = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const [timeframe, setTimeframe] = useState<string>("1D");
  const [holdingsTab, setHoldingsTab] = useState<HoldingsTab>("holdings");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const availableStocks = useFetchStockData();
  const { watchlistStocks: watchlistStocks, refetch: refetchWatchList } =
    useFetchWatchlistData();
  const holdingStocks = useFetchHoldingsData();
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(
    null
  );
  useEffect(() => {}, [availableStocks, watchlistStocks, holdingStocks]);

  const handleBuyClick = (stock: WatchlistStock) => {
    setSelectedStock(stock);
  };
  const handleAddWatchlist = async (stock: WatchlistStock) => {
    try {
      await addStockToWatchlist(stock);
      refetchWatchList();
    } catch (error) {
      alert("failed to add to stock");
    }
  };
  const filteredStocks = availableStocks
    .map((s) => {
      const isInWatchlist = watchlistStocks.some((w) => w.symbol === s.symbol);
      return {
        symbol: s.symbol,
        name: s.name,
        last_price: s.last_price,
        last_change_pct: s.last_change_pct,
        last_updated: s.last_updated,
        is_in_watchlist: isInWatchlist,
      };
    })
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalValue = 42195.4;
  const todayGain = 1247.83;
  const todayGainPercent = 3.05;

  return (
    <>
      {showAlert && (
        <div className="alert alert-success text-center" role="alert">
          Stock added successfully!
        </div>
      )}
      <Modal stock={selectedStock} onSuccess={handleSuccess} />
      <div className="portfolio-wrapper">
        <Navbar />
        <div className="container-fluid p-4">
          <AINewsBar />
          <div className="row g-4">
            <div className="col-lg-9">
              <PortfolioHeader
                totalValue={totalValue}
                todayGain={todayGain}
                todayGainPercent={todayGainPercent}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
              <PortfolioGraph timeframe={timeframe} />

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
                      <PortfolioAddStockList
                        filteredStocks={filteredStocks}
                        onBuyClick={handleBuyClick}
                        onAddWatchlist={handleAddWatchlist}
                        modalID="#staticBackdrop"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
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
    </>
  );
};

export default Dashboard;

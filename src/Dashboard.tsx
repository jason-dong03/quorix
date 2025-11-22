import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Dashboard.css";
import type { HoldingsTab, WatchlistStock } from "./types.ts";
import AINewsBar from "./components/DashboardPage/AINewsBar.tsx";
import Navbar from "./components/Shared/NavBar.tsx";
import { PortfolioHeader } from "./components/PortfolioHeader.tsx";
import { PortfolioGraph } from "./components/Shared/PortfolioGraph.tsx";
import { DashboardTabs } from "./components/DashboardPage/DashboardTabs.tsx";
import { PortfolioHoldingList } from "./components/PortfolioHoldingList.tsx";
import { PortfolioWatchlist } from "./components/PortfolioWatchlist.tsx";
import { PortfolioAddStockList } from "./components/PortfolioAddStockList.tsx";
import { TodaysPerformance } from "./components/TodaysPerformance.tsx";
import { PortfolioStats } from "./components/PortfolioStats.tsx";
import { Insights } from "./components/Insights.tsx";
import { QuickActions } from "./components/QuickActions.tsx";
import { useAuth } from "./context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import BuyStockModal from "./components/BuyStockModal.tsx";
import { usePortfolio } from "./context/PortfolioContext.tsx";
import { usePortfolioActions } from "./hooks/usePortfolioActions.ts";

const Dashboard: React.FC = () => {
  useEffect(() => {
    const u = new URL(window.location.href);
    if (u.searchParams.has('code') || u.searchParams.has('scope') || u.searchParams.has('state')) {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {watchlist, availableStocks, isLoading } = usePortfolio();
  const {addToWatchlist, removeFromWatchlist, sellStock, sellAllLots } = usePortfolioActions();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  const [timeframe, setTimeframe] = useState<string>("1D");
  const [holdingsTab, setHoldingsTab] = useState<HoldingsTab>("holdings");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null);


  const handleBuyClick = (stock: WatchlistStock) => {
    setSelectedStock(stock);
  };

  const handleAddWatchlist = async (stock: WatchlistStock) => {
    try {
      await addToWatchlist(stock);
    } catch (error) {
      alert("Failed to add to watchlist");
    }
  };

  const handleDeleteWatchlist = async (symbol: string) => {
    try {
      await removeFromWatchlist(symbol);
    } catch (error) {
      alert("Failed to remove from watchlist");
    }
  };

  const filteredStocks = availableStocks
    .map((s) => ({
      ...s,
      is_in_watchlist: watchlist.some((w) => w.symbol === s.symbol),
    }))
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (authLoading || isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <>
      <BuyStockModal stock={selectedStock} />
      <div className="portfolio-wrapper">
        <Navbar/>
        <div className="container-fluid p-4">
          <AINewsBar />
          <div className="row g-4">
            <div className="col-lg-9">
              <PortfolioHeader
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
              <PortfolioGraph timeframe={timeframe} />

              <div className="card holdings-card">
                <div className="card-body p-4">
                  <DashboardTabs
                    holdingsTab={holdingsTab}
                    setHoldingsTab={setHoldingsTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredStocks= {filteredStocks}
                  />
                  <div className="holdings-list">
                    {holdingsTab === "holdings" ? (
                      <PortfolioHoldingList
                        onBuyClick={handleBuyClick}
                        onSellClick={sellStock}
                        onRemovePosition={sellAllLots}
                        modalID="#staticBackdrop"
                      />
                    ) : holdingsTab === "watchlist" ? (
                      <PortfolioWatchlist
                        onDeleteClick={handleDeleteWatchlist}
                        modalID="#staticBackdrop"
                        onBuyClick={handleBuyClick}
                      />
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
              <TodaysPerformance />
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
import { useState, useEffect } from "react";
import type { WatchlistStock, Holding, MarketSentiment } from "../types";

export function useFetchStockData() {
  const [availableStocks, setAvailableStocks] = useState<WatchlistStock[]>([]);
  useEffect(() => {
    fetch(`/api/market_data`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setAvailableStocks(data.data ? data.data : []);
      })
      .catch(() => {
        setAvailableStocks([]);
      });
  }, []);
  return availableStocks;
}

export function useFetchWatchlistData() {
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch(`/api/watchlist`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setWatchlistStocks(data.watchlist ? data.watchlist : []);
      })
      .catch(() => {
        setWatchlistStocks([]);
      });
  }, [refreshKey]);

  const refetch = () => setRefreshKey((prev) => prev + 1);
  return { watchlistStocks, refetch };
}
export function useFetchHoldingsData() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    fetch(`/api/holdings`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setHoldings(data.holdings ? data.holdings : []);
      })
      .catch(() => {
        setHoldings([]);
      });
  }, [refreshKey]);
  const refetch = () => setRefreshKey((prev) => prev + 1);
  return {holdings, refetch};
}

export async function addStockToHolding(stock: Holding) {
  const res = await fetch(`/api/holdings`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol: stock.symbol,
      bought_at: stock.bought_at,
      shares: Number(stock.shares),
      avg_cost: Number(stock.avg_cost),
    }),
  });
  const result = await res.json();
  //console.log(result);
  return result.success;
}

export async function addStockToWatchlist(stock: WatchlistStock) {
  const res = await fetch(`/api/watchlist`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol: stock.symbol,
    }),
  });
  const result = await res.json();
  //console.log(result);
  return result.success;
}

export async function deleteStockFromWatchlist(symbol: string) {
  const res = await fetch(`/api/watchlist/${symbol}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const result = await res.json();
  return result.success;
}
export async function sellHoldingStock(symbol: string, shares:number, bought_at:number){
  const res = await fetch(`/api/sell_holding`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      s: symbol,
      sh: shares, 
      ba: bought_at
    })
  });
  const result = await res.json();
  return result.success;
}


export function useFetchMarketSentiment() {
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  useEffect(() => {
    fetch(`/api/market-sentiment`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSentiment({
          sp500: data.sp500 ?? null,
          nasdaq: data.nasdaq ?? null,
          dow: data.dow ?? null,
          updated_at: data.updated_at,
        });

      })
      .catch((err) => {
        console.error("Failed to fetch market sentiment", err);
        setSentiment(null);
      })
  }, []);
  useEffect(() => {
    console.log("sentiment updated:", sentiment);
  }, [sentiment]);
  
  return { sentiment };
}

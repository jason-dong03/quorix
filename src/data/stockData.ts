import { useState, useEffect } from "react";
import type { WatchlistStock, Holding } from "../types";

export function useFetchStockData() {
  const [availableStocks, setAvailableStocks] = useState<WatchlistStock[]>([]);
  useEffect(() => {
    fetch(`http://localhost:4000/api/market_data`, {
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
  useEffect(() => {
    fetch(`http://localhost:4000/api/watchlist`, {
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
  }, []);
  return watchlistStocks;
}
export function useFetchHoldingsData() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  useEffect(() => {
    fetch(`http://localhost:4000/api/holdings`, {
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
  }, []);
  return holdings;
}

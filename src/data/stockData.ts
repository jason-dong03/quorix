import { useState, useEffect } from "react";
import type { WatchlistStock, Stock } from "../types";

export function fetchStockData() {
  const [availableStocks, setAvailableStocks] = useState<WatchlistStock[]>([]);
  useEffect(() => {
    fetch(`http://localhost:4000/api/market_data`, {
      method: "GET",
      credentials: "include", // IMPORTANT so cookies are sent
    })
      .then((res) => res.json())
      .then((data) => {
        setAvailableStocks(data.data || null);
      })
      .catch(() => {
        setAvailableStocks([]);
      });
  }, []);
  return availableStocks;
}

export const watchlist: WatchlistStock[] = [
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    current: 142.5,
    change: 2.87,
  },
  { symbol: "JPM", name: "JPMorgan Chase", current: 178.9, change: 1.23 },
  { symbol: "DIS", name: "Walt Disney Co.", current: 92.45, change: -0.56 },
  { symbol: "AMZN", name: "Amazon.com Inc.", current: 178.35, change: 1.98 },
];

export const portfolio: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    current: 189.25,
    change: 2.43,
    value: 9462.5,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 35,
    current: 378.91,
    change: 1.89,
    value: 13261.85,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 40,
    current: 142.33,
    change: -0.82,
    value: 5693.2,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    shares: 20,
    current: 502.48,
    change: 3.21,
    value: 10049.6,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 15,
    current: 248.55,
    change: -1.45,
    value: 3728.25,
  },
];

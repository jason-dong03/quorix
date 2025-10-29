// types.ts
export interface Holding {
  name: string;
  symbol: string;
  last_price: number;
  last_change_pct: number;
  last_updated?: string;
  shares: number;
  avg_cost: number;
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  last_price: number;
  last_change_pct: number;
  last_updated?: string;
}

export interface NewsItem {
  title: string;
  impact: "positive" | "negative";
  relevance: number;
  ticker: string;
  summary: string;
}

export interface ChartData {
  date: string;
  value: number;
}

export interface User {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}
export type HoldingsTab = "holdings" | "watchlist" | "addstock";

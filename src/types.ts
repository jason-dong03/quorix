// types.ts
export interface Stock {
  symbol: string;
  name: string;
  shares: number;
  current: number;
  change: number;
  value: number;
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  current: number;
  change: number;
  updated_at?: string;
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

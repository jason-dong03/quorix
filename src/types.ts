// types.ts
export interface Holding {
  name: string;
  symbol: string;
  sector: string;
  last_price: number;
  last_change_pct: number;
  last_updated?: string;
  shares: number;
  avg_cost: number;
  updated_at?: string;
  bought_at: number;
}

export interface WatchlistStock {
  symbol: string;
  sector: string;
  name: string;
  last_price: number;
  last_change_pct: number;
  last_updated?: string;
}

export interface NewsItem {
  title: string;
  impact: 0 | 1;
  relevance: number;
  symbol: string;
  summary: string;
  source: string;
  source_url: string;
  news_date: string;
}

export interface ChartData {
  timestamp: number;
  date: string;
  value: number;
  dayStart?: number;
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
  logout: () => Promise<void>;
}
export type HoldingsTab = "holdings" | "watchlist" | "addstock";

export type Position = Holding & {
  lots: Holding[];
  shares: number;        // summed over lots
  avg_cost: number;      // weighted avg
  totalCost: number;     // Σ(shares_i * bought_at_i)
};

type IndexSentiment = {
  symbol: string;
  last_change_pct: number;
  last_price: number;
};

export type MarketSentiment = {
  sp500: IndexSentiment | null;
  nasdaq: IndexSentiment | null;
  dow: IndexSentiment | null;
  updated_at: string;
};

export interface FormData {
    portfolioIntro: string;
    investmentGoal: string;
    riskTolerance: string;
    experience: string;
    portfolioName: string;
}

interface Option {
    value: string;
    label: string;
    icon: string;
    desc?: string;
}

export interface Question {
    id: keyof FormData;
    question: string;
    options?: Option[];
    type?: string;
    placeholder?: string;
}


export interface Portfolio{
  id: number;
  user_id: number;
  name: string;
  description: string;
  is_default: boolean;
  created_at: string;
}
export interface PortfolioContextType {
  // Portfolio management
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  setCurrentPortfolio: (portfolio: Portfolio) => void;
  switchPortfolio: (portfolioId: number) => void;
  createPortfolio: (name: string, description: string) => Promise<Portfolio>;
  updatePortfolio: (portfolioId: number, name: string, description: string) => Promise<void>;
  deletePortfolio: (portfolioId: number) => Promise<void>;
  setDefaultPortfolio: (portfolioId: number) => Promise<void>;

  // Holdings (filtered by current portfolio)
  holdings: Holding[];
  watchlist: WatchlistStock[];
  news: NewsItem[];
  availableStocks: WatchlistStock[];
  
  
  // Refetch functions
  refetchPortfolios: () => void;
  refetchHoldings: () => void;
  refetchWatchlist: () => void;
  
  // Computed data
  positions: Position[];

  // Risk metrics
  riskScore: number;
  riskScoreLabel: string;
  diversificationPct: number;
  diversificationColor: [string, string];
}

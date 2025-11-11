import React, {
  createContext, useContext,
  type ReactNode, useMemo
} from 'react';
import type { Holding, NewsItem, Position, WatchlistStock } from '../types';
import { useFetchHoldingsData, useFetchWatchlistData, useFetchStockData } from '../data/stockData';
import { useFetchAiNews } from '../data/newsData';
import {
  herfindahlIndex,
  numHoldingsRisk,
  sectorConcentration,
  getRiskScoreLabel,
  getDiversificationPercentage,
  getDiversificationPercentageColor,
} from '../data/insightsData';

interface PortfolioContextType {
  holdings: Holding[];
  watchlist: WatchlistStock[];
  news: NewsItem[];
  availableStocks: WatchlistStock[];
  isLoading: boolean;
  refetchHoldings: () => Promise<void>;
  refetchWatchlist: () => Promise<void>;
  positions: Position[];

  riskScore: number;                         // 0–10 
  riskScoreLabel: string;                    // "Low/Medium/High Risk"
  diversificationPct: number;                // 0–100
  diversificationColor: [string, string];    
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { holdings, refetch: refetchHoldingsRaw } = useFetchHoldingsData();
  const { watchlistStocks: watchlist, refetch: refetchWatchlistRaw } = useFetchWatchlistData();

 
  const availableStocks = useFetchStockData(); 

 
  const isLoading = !holdings || !watchlist || !availableStocks;


  const symbols = useMemo(
    () => Array.from(new Set((holdings ?? []).map(h => h.symbol))).sort(),
    [holdings]
  );

  const positions: Position[] = useMemo(() => {
    const map = new Map<string, Position>();
    for (const lot of holdings ?? []) {
      const sym = lot.symbol;
      const prev = map.get(sym);
      if (!prev) {
        map.set(sym, {
          ...lot,
          lots: [lot],
          shares: Number(lot.shares),
          totalCost: Number(lot.shares) * Number(lot.bought_at),
          avg_cost: Number(lot.bought_at),
        });
      } else {
        const newShares = prev.shares + Number(lot.shares);
        const newTotalCost = prev.totalCost + Number(lot.shares) * Number(lot.bought_at);
        map.set(sym, {
          ...prev,
          lots: [...prev.lots, lot],
          shares: newShares,
          totalCost: newTotalCost,
          avg_cost: newShares ? newTotalCost / newShares : 0,
        });
      }
    }
    return Array.from(map.values());
  }, [holdings]);

  const { riskScore, riskScoreLabel, diversificationPct, diversificationColor } = useMemo(() => {
    const num = (v: any, d = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : d;
    };

    // diversification
    const diversification = (holdings?.length ?? 0) === 0
      ? 0
      : getDiversificationPercentage(holdings, availableStocks || []);
    const diversification_color = getDiversificationPercentageColor(diversification);

    // risk score
    const HI = num(herfindahlIndex(holdings || [], availableStocks || [])) * 10;
    const sectorScore = num(sectorConcentration(holdings || [], availableStocks || [])) * 10;
    const holdingRiskNum = num(numHoldingsRisk(holdings || []));

    const raw = (holdings?.length ?? 0) === 0
      ? 0
      : num(HI) * 0.35 + num(sectorScore) * 0.35 + num(holdingRiskNum) * 0.3;

    const score = Number(raw.toFixed(1));
    const label = getRiskScoreLabel(score);

    return {
      riskScore: score,
      riskScoreLabel: label,
      diversificationPct: diversification,
      diversificationColor: diversification_color as [string, string],
    };
  }, [holdings, availableStocks]);


  const { news } = useFetchAiNews(symbols);

  const value = useMemo<PortfolioContextType>(() => ({
    holdings: holdings ?? [],
    watchlist: watchlist ?? [],
    availableStocks: availableStocks ?? [],
    news: news ?? [],
    isLoading,
    positions,
    riskScore,
    riskScoreLabel,
    diversificationColor,
    diversificationPct,
    refetchHoldings: () => Promise.resolve(refetchHoldingsRaw()),
    refetchWatchlist: () => Promise.resolve(refetchWatchlistRaw()),
  }), [holdings, watchlist, availableStocks, news, isLoading, positions, refetchHoldingsRaw, refetchWatchlistRaw]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
};

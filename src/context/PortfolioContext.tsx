import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import type { Portfolio, PortfolioContextType, Position } from "../types";
import {
  useFetchWatchlistData,
  useFetchStockData,
  useFetchHoldingsData,
} from "../data/stockData";
import { useFetchAiNews } from "../data/newsData";
import {
  herfindahlIndex,
  numHoldingsRisk,
  sectorConcentration,
  getRiskScoreLabel,
  getDiversificationPercentage,
  getDiversificationPercentageColor,
} from "../data/insightsData";
import {
  useFetchAllPortfolios,
  createPortfolio as apiCreatePortfolio,
  updatePortfolio as apiUpdatePortfolio,
  deletePortfolio as apiDeletePortfolio,
  setDefaultPortfolio as apiSetDefaultPortfolio,
} from "../data/getPortfolios";

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { portfolios, refetch: refetchPortfoliosRaw } = useFetchAllPortfolios();
  const availableStocks = useFetchStockData();

  const [currentPortfolio, setCurrentPortfolioState] =
    useState<Portfolio | null>(null);


  useEffect(() => {
    if (portfolios.length > 0 && !currentPortfolio) {
      const savedPortfolioId = localStorage.getItem("currentPortfolioId");

      if (savedPortfolioId) {
        const saved = portfolios.find(
          (p) => p.id === parseInt(savedPortfolioId, 10)
        );
        if (saved) {
          setCurrentPortfolioState(saved);
          return;
        }
      }

      const defaultPortfolio = portfolios.find((p) => p.is_default);
      setCurrentPortfolioState(defaultPortfolio || portfolios[0]);
    }
  }, [portfolios, currentPortfolio]);

  // holdings /watchlists for current portfolio
  const currentPortfolioId = currentPortfolio?.id ?? null;

  const {holdings,refetch: refetchHoldings,} = useFetchHoldingsData(currentPortfolioId);
  const { watchlistStocks: watchlist, refetch: refetchWatchlistRaw } = useFetchWatchlistData(currentPortfolioId);
  

  const isReady = useMemo(
    () => portfolios.length > 0 && !!currentPortfolio,
    [portfolios, currentPortfolio]
  );
  const setCurrentPortfolio = useCallback((portfolio: Portfolio) => {
    setCurrentPortfolioState(portfolio);
    localStorage.setItem("currentPortfolioId", portfolio.id.toString());
  }, []);

  const switchPortfolio = useCallback(
    (portfolioId: number) => {
      const portfolio = portfolios.find((p) => p.id === portfolioId);
      if (portfolio) {
        setCurrentPortfolio(portfolio);
      }
    },
    [portfolios, setCurrentPortfolio]
  );

  const createPortfolio = useCallback(
    async (name: string, description: string): Promise<Portfolio> => {
      const newPortfolio = await apiCreatePortfolio(name, description);

      refetchPortfoliosRaw();

      setCurrentPortfolioState(newPortfolio);
      localStorage.setItem("currentPortfolioId", newPortfolio.id.toString());

      return newPortfolio;
    },
    [refetchPortfoliosRaw]
  );

  const updatePortfolio = useCallback(
    async (portfolioId: number, name: string, description: string) => {
      const updated = await apiUpdatePortfolio(portfolioId, name, description);

      refetchPortfoliosRaw();

      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolioState(updated);
        localStorage.setItem("currentPortfolioId", updated.id.toString());
      }
    },
    [refetchPortfoliosRaw, currentPortfolio]
  );

  const deletePortfolio = useCallback(
    async (portfolioId: number) => {
      await apiDeletePortfolio(portfolioId);

      // if we just deleted the current portfolio, clear it
      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolioState(null);
        localStorage.removeItem("currentPortfolioId");
      }

      // refresh list; useEffect will pick a new current portfolio if possible
      refetchPortfoliosRaw();
    },
    [refetchPortfoliosRaw, currentPortfolio?.id]
  );

  const setDefaultPortfolio = useCallback(
    async (portfolioId: number) => {
      await apiSetDefaultPortfolio(portfolioId);
      refetchPortfoliosRaw();

      // if we know the current one is default, we could patch it
      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolioState({
          ...currentPortfolio,
          is_default: true,
        });
      }
    },
    [refetchPortfoliosRaw, currentPortfolio]
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
        const newTotalCost =
          prev.totalCost + Number(lot.shares) * Number(lot.bought_at);
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

  // ---- Risk metrics ----
  const {
    riskScore,
    riskScoreLabel,
    diversificationPct,
    diversificationColor,
  } = useMemo(() => {
    const num = (v: any, d = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : d;
    };

    if ((holdings?.length ?? 0) === 0) {
      return {
        riskScore: 0,
        riskScoreLabel: "No Holdings",
        diversificationPct: 0,
        diversificationColor: ["#6b7280", "#6b7280"] as [string, string],
      };
    }

    const diversification = getDiversificationPercentage(
      holdings,
      availableStocks || []
    );
    const diversification_color =
      getDiversificationPercentageColor(diversification);

    const HI = num(herfindahlIndex(holdings || [], availableStocks || [])) * 10;
    const sectorScore =
      num(sectorConcentration(holdings || [], availableStocks || [])) * 10;
    const holdingRiskNum = num(numHoldingsRisk(holdings || []));

    const raw =
      num(HI) * 0.35 + num(sectorScore) * 0.35 + num(holdingRiskNum) * 0.3;
    const score = Number(raw.toFixed(1));
    const label = getRiskScoreLabel(score);

    return {
      riskScore: score,
      riskScoreLabel: label,
      diversificationPct: diversification,
      diversificationColor: diversification_color as [string, string],
    };
  }, [holdings, availableStocks]);

  const symbols = useMemo(
    () => Array.from(new Set((holdings ?? []).map((h) => h.symbol))).sort(),
    [holdings]
  );
  const { news } = useFetchAiNews(symbols);
  //context vals
  const value = useMemo<PortfolioContextType>(
    () => ({
      portfolios,
      currentPortfolio,
      setCurrentPortfolio,
      switchPortfolio,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
      setDefaultPortfolio,

      holdings: holdings ?? [],
      watchlist: watchlist ?? [],
      availableStocks: availableStocks ?? [],
      news: news ?? [],

      positions,

      riskScore,
      riskScoreLabel,
      diversificationColor,
      diversificationPct,

      refetchPortfolios: refetchPortfoliosRaw,
      refetchHoldings,
      refetchWatchlist: refetchWatchlistRaw,
      isReady, 
    }),
    [
      portfolios,
      currentPortfolio,
      setCurrentPortfolio,
      switchPortfolio,
      createPortfolio,
      updatePortfolio,
      deletePortfolio,
      setDefaultPortfolio,
      holdings,
      watchlist,
      availableStocks,
      news,
      positions,
      riskScore,
      riskScoreLabel,
      diversificationColor,
      diversificationPct,
      refetchPortfoliosRaw,
      refetchHoldings,
      refetchWatchlistRaw,
      isReady, 
    ]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
};

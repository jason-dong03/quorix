import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Holding, WatchlistStock } from '../types';
import { useFetchHoldingsData, useFetchWatchlistData, useFetchStockData } from '../data/stockData';

interface PortfolioContextType {
  holdings: Holding[];
  watchlist: WatchlistStock[];
  availableStocks: WatchlistStock[];
  isLoading: boolean;
  refetchHoldings: () => Promise<void>;
  refetchWatchlist: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { holdings, refetch: refetchHoldingsRaw } = useFetchHoldingsData();
  const { watchlistStocks: watchlist, refetch: refetchWatchlistRaw } = useFetchWatchlistData();
  const availableStocks = useFetchStockData();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (holdings && watchlist && availableStocks) {
      setIsLoading(false);
    }
  }, [holdings, watchlist, availableStocks]);

  const value = {
    holdings: holdings || [],
    watchlist: watchlist || [],
    availableStocks: availableStocks || [],
    isLoading,
    refetchHoldings: () => Promise.resolve(refetchHoldingsRaw()),
    refetchWatchlist: () => Promise.resolve(refetchWatchlistRaw()),
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};
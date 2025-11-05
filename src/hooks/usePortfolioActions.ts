import { useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  addStockToWatchlist,
  deleteStockFromWatchlist,
  sellHoldingStock,
} from '../data/stockData';
import type { Holding, WatchlistStock } from '../types';

export const usePortfolioActions = () => {
  const { refetchHoldings, refetchWatchlist } = usePortfolio();

  const addToWatchlist = useCallback(async (stock: WatchlistStock) => {
    try {
      await addStockToWatchlist(stock);
      await refetchWatchlist();
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      throw error;
    }
  }, [refetchWatchlist]);

  const removeFromWatchlist = useCallback(async (symbol: string) => {
    try {
      await deleteStockFromWatchlist(symbol);
      await refetchWatchlist();
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      throw error;
    }
  }, [refetchWatchlist]);

  const sellStock = useCallback(async (stock: Holding) => {
    try {
      await sellHoldingStock(stock.symbol, stock.shares, stock.bought_at);
      await refetchHoldings();
    } catch (error) {
      console.error('Failed to sell stock:', error);
      throw error;
    }
  }, [refetchHoldings]);

  const sellAllLots = useCallback(async (symbol: string, lots: Holding[]) => {
    try {
      await Promise.all(
        lots.map(lot => sellHoldingStock(symbol, lot.shares, lot.bought_at))
      );
      await refetchHoldings();
    } catch (error) {
      console.error('Failed to sell all lots:', error);
      throw error;
    }
  }, [refetchHoldings]);

  return {
    addToWatchlist,
    removeFromWatchlist,
    sellStock,
    sellAllLots,
  };
};
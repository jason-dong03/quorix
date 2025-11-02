import type { Holding, WatchlistStock } from "../types";

export function getPortfolioTotalValue(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
): number {
  return holdings.reduce((sum, h) => {
    const stock = stocks_dict.find((s) => s.symbol == h.symbol);
    const current_price = stock ? stock.last_price : 0;
    return sum + h.shares * current_price;
  }, 0);
}

export function getPortfolioTodayGain(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
): number {
  return holdings.reduce((sum, h) => {
    const stock = stocks_dict.find((s) => s.symbol == h.symbol);
    const change_pct = stock ? stock.last_change_pct : 0;
    const current_price = stock ? stock.last_price : 0;
    return sum + h.shares * current_price * (change_pct / 100);
  }, 0);
}
export function getPortfolioTodayGainPct(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
) {
  const today_gain = getPortfolioTodayGain(holdings, stocks_dict);
  const total_portfolio_value = getPortfolioTotalValue(holdings, stocks_dict);

  return (today_gain / total_portfolio_value) * 100;
}
export function getPortfolioTotalInvested(holdings: Holding[]) {
  const res = holdings.reduce((sum, h) => sum + h.shares * h.bought_at, 0);
  return res;
}

export function getPortfolioTotalReturn(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
) {
  return (
    getPortfolioTotalValue(holdings, stocks_dict) -
    getPortfolioTotalInvested(holdings)
  );
}

export function getPortfolioTotalReturnPct(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
) {
  return (
    (getPortfolioTotalReturn(holdings, stocks_dict) /
      getPortfolioTotalInvested(holdings)) *
    100
  );
}

export function getNumHoldings(holdings: Holding[]) {
  const numHoldings = new Set(holdings.map((h) => h.symbol)).size;

  return numHoldings;
}

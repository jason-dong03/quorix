import type { Holding, WatchlistStock } from "../types";
import { getPortfolioTotalValue } from "./dashboardCalculationFunctions";

export function herfindahlIndex(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
): number {
  const total_portfolio_value = getPortfolioTotalValue(holdings, stocks_dict);
  const groupBySymbol = holdings.reduce((acc, h) => {
    if (!acc[h.symbol]) {
      acc[h.symbol] = 0;
    }
    acc[h.symbol] += Number(h.shares);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(groupBySymbol).reduce((sum, [symbol, totalShares]) => {
    const stock = stocks_dict.find((s) => s.symbol == symbol);
    const current_price = stock ? stock.last_price : 0;
    const position_value = totalShares * current_price;
    const weight = position_value / total_portfolio_value;
    return sum + weight ** 2;
  }, 0);
}
export function sectorConcentration(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
) {
  const total_portfolio_value = getPortfolioTotalValue(holdings, stocks_dict);
  const groupBySymbol = holdings.reduce((acc, h) => {
    if (!acc[h.symbol]) {
      acc[h.symbol] = 0;
    }
    acc[h.symbol] += Number(h.shares);
    return acc;
  }, {} as Record<string, number>);
  const sectorValues: Record<string, number> = {};
  Object.entries(groupBySymbol).forEach(([symbol, totalShares]) => {
    const stock = stocks_dict.find((s) => s.symbol === symbol);
    if (!stock) return;
    const position_value = totalShares * stock.last_price;
    const sector = stock.sector || "Unknown";

    if (!sectorValues[sector]) {
      sectorValues[sector] = 0;
    }
    sectorValues[sector] += position_value;
  });
  return Object.values(sectorValues).reduce((sum, sectorValue) => {
    const weight = sectorValue / total_portfolio_value;
    return sum + weight ** 2;
  }, 0);
}

export function numHoldingsRisk(holdings: Holding[]) {
  const numHoldings = new Set(holdings.map((h) => h.symbol)).size;
  return numHoldings < 3
    ? 10
    : numHoldings < 5
    ? 9
    : numHoldings < 7
    ? 8
    : numHoldings < 8
    ? 7
    : numHoldings < 10
    ? 6
    : numHoldings < 13
    ? 5
    : numHoldings < 17
    ? 4
    : numHoldings < 21
    ? 3
    : numHoldings < 31
    ? 2
    : 1;
}
export function getRiskScoreLabel(risk_score: number): string {
  if (risk_score <= 2) return "Very Low";
  if (risk_score <= 4) return "Low";
  if (risk_score <= 6) return "Moderate";
  if (risk_score <= 8) return "Moderate-High";
  return "High";
}
export function getDiversificationPercentage(
  holdings: Holding[],
  stocks_dict: WatchlistStock[]
): number {
  const HI = herfindahlIndex(holdings, stocks_dict);
  const SC = sectorConcentration(holdings, stocks_dict);

  const HI_diverse = (1 - HI) * 100;
  const SC_diverse = (1 - SC) * 100;

  const diversification = HI_diverse * 0.5 + SC_diverse * 0.5;
  return Math.round(diversification);
}
export function getDiversificationPercentageColor(
  diversification_pct: number
): string[] {
  if (diversification_pct <= 34) return ["bg-danger", "text-danger"];
  if (diversification_pct <= 67) return ["bg-warning", "text-warning"];
  return ["bg-success", "text-success"];
}

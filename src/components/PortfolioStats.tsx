import {
  getNumHoldings,
  getPortfolioTotalInvested,
  getPortfolioTotalReturn,
  getPortfolioTotalReturnPct,
} from "../data/dashboardCalculationFunctions";
import type { Holding, WatchlistStock } from "../types";

interface PortfolioStats {
  holdings: Holding[];
  stocks_dict: WatchlistStock[];
}
export const PortfolioStats: React.FC<PortfolioStats> = ({
  holdings,
  stocks_dict,
}) => {
  const totalInvested = getPortfolioTotalInvested(holdings);
  const totalReturn = getPortfolioTotalReturn(holdings, stocks_dict);
  const totalReturnPct = getPortfolioTotalReturnPct(holdings, stocks_dict);
  const holdings_num = getNumHoldings(holdings);
  return (
    <>
      <div className="card stats-card mb-4">
        <div className="card-body">
          <h6 className="mb-3">Portfolio Stats</h6>
          <div className="stat-row">
            <small className="text-muted">Total Invested</small>
            <span className="fw-semibold">
              $
              {totalInvested.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="stat-row">
            <small className="text-muted">Total Return</small>
            <span
              className={`fw-semibold ${
                totalReturn > 0 ? "text-success" : "text-danger"
              }`}
            >
              {totalReturn > 0 ? "+" : "-"}$
              {Math.abs(Number(totalReturn)).toFixed(2)}
            </span>
          </div>
          <div className="stat-row">
            <small className="text-muted">Return %</small>
            <span
              className={`fw-semibold ${
                totalReturn > 0 ? "text-success" : "text-danger"
              }`}
            >
              {Number(totalReturnPct).toFixed(2)}%
            </span>
          </div>
          <div className="stat-row border-0">
            <small className="text-muted">Holdings</small>
            <span
              className={`fw-semibold ${
                holdings_num > 1 ? "text-success" : "text-white"
              }`}
            >
              {holdings_num} {holdings_num > 1 ? "stocks" : "stock"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

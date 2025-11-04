import { TrendingUp } from "lucide-react";
import {
  getPortfolioTodayGain,
  getPortfolioTodayGainPct,
  getPortfolioTotalValue,
} from "../data/dashboardCalculationFunctions";
import type { Holding, WatchlistStock } from "../types";

interface TodaysPerformanceProps {
  holdings: Holding[];
  stocks_dict: WatchlistStock[];
}
export const TodaysPerformance: React.FC<TodaysPerformanceProps> = ({
  holdings,
  stocks_dict,
}) => {
  const totalValue = getPortfolioTotalValue(holdings, stocks_dict);
  const todayGain = getPortfolioTodayGain(holdings, stocks_dict);
  const todayGainPercent = getPortfolioTodayGainPct(holdings, stocks_dict);
  return (
    <>
      <div className="card stats-card stats-card-success mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <TrendingUp size={20} className="me-2" />
            <h6 className="mb-0">Today's Performance</h6>
          </div>
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Gain</small>
            <h2
              className={`${
                todayGain > 0 ? "text-success" : todayGain === 0? "text-muted" : "text-danger"
              } mb-0`}
            >
              {todayGain > 0 ? "+" : todayGain === 0? "" : "-"}$
              {Math.abs(todayGain).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Percentage</small>
            <h2
              className={`${
                todayGainPercent > 0 ? "text-success" : Number.isNaN(todayGainPercent) ? "text-muted": "text-danger"
              } mb-0`}
            >
              {todayGainPercent > 0 ? "+" : ""}
              {(Number.isFinite(Number(todayGainPercent)) ? todayGainPercent.toLocaleString(
                  undefined,{minimumFractionDigits: 2,maximumFractionDigits: 2,}) : 0)}%

            </h2>
          </div>
          <hr />
          <div>
            <small className="text-muted d-block mb-1">Opening Value</small>
            <h5 className="mb-0">
              $
              {Math.abs(totalValue - todayGain).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h5>
          </div>
        </div>
      </div>
    </>
  );
};

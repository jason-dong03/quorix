import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import {
  getPortfolioTodayGain,
  getPortfolioTodayGainPct,
  getPortfolioTotalValue,
} from "../data/dashboardCalculationFunctions";
import { usePortfolio } from "../context/PortfolioContext";

interface PortfolioHeaderProps {
  timeframe: string;
  setTimeframe: React.Dispatch<React.SetStateAction<string>>;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  timeframe,
  setTimeframe,
}) => {
  const { holdings, availableStocks: stock_dict } = usePortfolio();
  const todayGainPct = getPortfolioTodayGainPct(holdings, stock_dict);
  const todayGain = getPortfolioTodayGain(holdings, stock_dict);
  return (
    <>
      <div className="card portfolio-header-card mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-end justify-content-between">
            <div>
              <div className="d-flex align-items-center text-muted mb-2">
                <Sparkles size={16} className="me-2" />
                <small>Total Portfolio Value</small>
              </div>
              <h1 className="display-3 fw-bold mb-3">
                $
                {getPortfolioTotalValue(holdings, stock_dict).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </h1>
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`d-flex align-items-center ${
                    todayGain > 0 ? "text-success" : todayGain ===0? "text-muted": "text-danger"
                  } fs-4`}
                >
                  {todayGain > 0 ? (
                    <>
                      <TrendingUp size={24} className="me-2" />
                    </>
                  ) : todayGain === 0? (<></>) : (
                    <TrendingDown size={24} className="me-2" />
                  )}
                  <span className="fw-semibold">
                    {todayGain > 0 ? "+" : todayGain ===0? "" :"-"}$
                    {Math.abs(todayGain).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <span
                  className={`${
                    todayGainPct > 0 ? "text-success" : Number.isNaN(todayGainPct)? "text-muted" :"text-danger"
                  } fs-4 fw-semibold`}
                >
                  {todayGainPct > 0 ? "+" : ""}
                 {(Number.isFinite(Number(todayGainPct)) ? todayGainPct.toLocaleString(
                  undefined,{minimumFractionDigits: 2,maximumFractionDigits: 2,}) : 0)}%
                </span>
                <small className="text-muted">Today</small>
              </div>
            </div>

            <div className="btn-group" role="group">
              {["1D", "5D", "1M"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`btn ${
                    timeframe === tf ? "btn-primary" : "btn-outline-secondary"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

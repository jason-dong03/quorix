import { Sparkles, TrendingUp } from "lucide-react";

interface PortfolioHeaderProps {
  totalValue: number;
  todayGain: number;
  todayGainPercent: number;
  timeframe: string;
  setTimeframe: React.Dispatch<React.SetStateAction<string>>;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  totalValue,
  todayGain,
  todayGainPercent,
  timeframe,
  setTimeframe,
}) => {
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
                {totalValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h1>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center text-success fs-4">
                  <TrendingUp size={24} className="me-2" />
                  <span className="fw-semibold">
                    +${todayGain.toLocaleString()}
                  </span>
                </div>
                <span className="text-success fs-4 fw-semibold">
                  +{todayGainPercent}%
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

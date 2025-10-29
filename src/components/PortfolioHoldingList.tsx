import { TrendingDown, TrendingUp } from "lucide-react";
import type { Holding } from "../types";

interface PortfolioHoldingListProps {
  portfolio: Holding[];
}
export const PortfolioHoldingList: React.FC<PortfolioHoldingListProps> = ({
  portfolio,
}) => {
  return (
    <>
      {portfolio.map((stock) => {
        const isPositive = stock.last_change_pct >= 0;
        return (
          <div key={stock.symbol} className="card stock-card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  <div className="stock-icon me-3">
                    {stock.symbol.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-3 mb-1">
                      <h5 className="mb-0">{stock.symbol}</h5>
                      <small className="text-muted">{stock.name}</small>
                    </div>
                    <small className="text-muted">
                      <span className="text-success">
                        {Number(stock.shares).toFixed(2)}{" "}
                      </span>
                      shares @ ${stock.last_price}
                    </small>
                  </div>
                </div>

                <div className="text-end">
                  <h4 className="mb-1">
                    $
                    {(
                      Number(stock.shares) * Number(stock.last_change_pct)
                    ).toFixed(2)}
                  </h4>
                  <div
                    className={`d-flex align-items-center justify-content-end ${
                      isPositive ? "text-success" : "text-danger"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={20} className="me-1" />
                    ) : (
                      <TrendingDown size={20} className="me-1" />
                    )}
                    <span className="fw-semibold">
                      {isPositive ? "+" : ""}
                      {stock.last_change_pct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

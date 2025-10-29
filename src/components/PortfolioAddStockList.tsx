import { TrendingDown, TrendingUp } from "lucide-react";
import type { WatchlistStock } from "../types";

interface PortfolioAddStockListProps {
  filteredStocks: WatchlistStock[];
}
export const PortfolioAddStockList: React.FC<PortfolioAddStockListProps> = ({
  filteredStocks,
}) => {
  return (
    <>
      {filteredStocks.map((stock) => {
        const isPositive = stock.last_change_pct >= 0;
        console.log(isPositive);
        return (
          <div key={stock.symbol} className="card stock-card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  <div className="stock-icon stock-icon-add me-3">
                    {stock.symbol.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-3 mb-1">
                      <h5 className="mb-0">{stock.symbol}</h5>
                      <small className="text-muted">{stock.name}</small>
                    </div>
                    <small className="text-muted">
                      Last Updated:{" "}
                      {stock.last_updated
                        ? new Date(stock.last_updated).toLocaleString()
                        : "N/A"}
                    </small>
                  </div>
                </div>
                <div className="text-end d-flex align-items-center gap-3">
                  <div>
                    <h4 className="mb-1">
                      ${Number(stock.last_price).toFixed(2)}
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
                  <button className="btn btn-primary btn-sm">Add Stock</button>
                  <button className="btn btn-watchlist btn-sm">
                    Add Watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

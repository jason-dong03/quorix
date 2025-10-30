import { TrendingDown, TrendingUp } from "lucide-react";
import type { WatchlistStock, Holding } from "../types";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../css/Modal.css";
interface PortfolioAddStockListProps {
  filteredStocks: WatchlistStock[];
  onBuyClick?: (stock: WatchlistStock) => void;
  modalID?: string;
}
export const PortfolioAddStockList: React.FC<PortfolioAddStockListProps> = ({
  filteredStocks,
  onBuyClick,
  modalID,
}) => {
  const handleAddWatchlist = () => {
    console.log("Add to watchlist clicked");
  };
  const handleBuyClick = (stock: WatchlistStock) => {
    if (onBuyClick) {
      onBuyClick(stock);
    }
  };
  return (
    <>
      {filteredStocks.map((stock) => {
        const isPositive = stock.last_change_pct >= 0;
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
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target={modalID}
                    onClick={() => handleBuyClick(stock)}
                  >
                    Buy
                  </button>
                  <button className="btn btn-watchlist btn-sm text-white">
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

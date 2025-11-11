import { TrendingDown, TrendingUp } from "lucide-react";
import type { WatchlistStock } from "../types";
import "../css/Modal.css";
import { useState } from "react";
interface PortfolioAddStockListProps {
  filteredStocks: any[];
  onAddWatchlist: (stock: WatchlistStock) => Promise<void>;
  onBuyClick?: (stock: WatchlistStock) => void;
  modalID?: string;
}
export const PortfolioAddStockList: React.FC<PortfolioAddStockListProps> = ({
  filteredStocks,
  onBuyClick,
  onAddWatchlist,
  modalID,
}) => {
  const [addingSymbol, setAddingSymbol] = useState<string | null>(null);

  const handleAddWatchlistClick = async (stock: WatchlistStock) => {
    setAddingSymbol(stock.symbol);
    try {
      await onAddWatchlist(stock);
    } finally {
      setAddingSymbol(null);
    }
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
                      <small className="badge bg-primary">{stock.sector}</small>
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
                  <button
                    className={`btn btn-sm text-white ${
                      stock.is_in_watchlist ? "btn-success" : "btn-watchlist"
                    }`}
                    onClick={() => handleAddWatchlistClick(stock)}
                    disabled={
                      stock.is_in_watchlist || addingSymbol === stock.symbol
                    }
                  >
                    {addingSymbol === stock.symbol ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Adding...
                      </>
                    ) : stock.is_in_watchlist ? (
                      "✓ In Watchlist"
                    ) : (
                      "Add to Watchlist"
                    )}
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

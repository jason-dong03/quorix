import { useMemo, useState } from "react";
import type { Holding, WatchlistStock } from "../types";
import { addStockToHolding } from "../data/stockData";
import { usePortfolio } from "../context/PortfolioContext";

interface ModalProps {
  stock: WatchlistStock | null;
  onSuccess: () => void;
}

export const BuyStockModal: React.FC<ModalProps> = ({ stock, onSuccess }) => {
  const { refetchHoldings } = usePortfolio();
  const price = useMemo(() => Number(stock?.last_price ?? 0), [stock]);
  const [tab, setTab] = useState<"shares" | "amount">("shares");
  const [shares, setShares] = useState<number>(1);
  const [amount, setAmount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estCost = useMemo(() => +(shares * price).toFixed(2), [shares, price]);
  const estShares = useMemo(
    () => +(amount / price || 0).toFixed(3),
    [amount, price]
  );
  
  const canConfirm =
    !!stock &&
    price > 0 &&
    ((tab === "shares" && shares > 0) ||
      (tab === "amount" && amount > 0 && estShares > 0));

  const handleConfirm = async () => {
    if (!stock || !canConfirm || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const holdingStock: Holding = {
        ...stock,
        bought_at: stock.last_price,
        shares: tab === "shares" ? shares : estShares,
        avg_cost: tab === "shares" ? estCost : amount,
      };
      
      const addStock = await addStockToHolding(holdingStock);
      
      if (addStock) {
        await refetchHoldings(); // Refetch data instead of reload
        onSuccess();
        console.log("success, added new stocks");
        
        // Reset form
        setShares(1);
        setAmount(100);
        setTab("shares");
      } else {
        console.log("error, failed to add stocks");
        alert("Failed to add stock");
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("Failed to add stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-md-down">
          <div className="modal-content custom-modal">
            <div className="modal-header border-0">
              <div className="stock-icon stock-icon-add me-3">
                {stock?.symbol.charAt(0)}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-3 mb-1">
                  <h5 className="text-white mb-0">{stock?.symbol}</h5>
                  <small className="text-success">{stock?.name}</small>
                </div>
                <small className="text-muted">
                  Last Updated:{" "}
                  {stock?.last_updated
                    ? new Date(stock.last_updated).toLocaleString()
                    : "N/A"}
                </small>
              </div>
              <div className="text-white me-5">
                Current Price: {Number(stock?.last_price).toFixed(2)}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-white">
              <ul className="nav nav-pills mb-3 gap-2">
                <li className="nav-item">
                  <button
                    className={`nav-link ${tab === "shares" ? "active" : ""}`}
                    onClick={() => setTab("shares")}
                  >
                    Buy by Shares
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${tab === "amount" ? "active" : ""}`}
                    onClick={() => setTab("amount")}
                  >
                    Buy by Amount
                  </button>
                </li>
              </ul>

              {tab === "shares" ? (
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Shares</label>
                    <input
                      type="number"
                      min={0}
                      step={0.001}
                      className="form-control"
                      value={shares}
                      onChange={(e) => setShares(Number(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Est. Cost</label>
                    <div className="form-control bg-dark text-white">
                      ${estCost.toFixed(2)}
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <div>Total</div>
                    <div>${estCost}</div>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Est. Shares</label>
                    <div className="form-control bg-dark text-white">
                      {estShares.toFixed(3)}
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <div>Total</div>
                    <div>{estShares} Shares</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                disabled={!canConfirm || isSubmitting}
                onClick={handleConfirm}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyStockModal;
import { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import type { Holding } from "../types";

interface PortfolioHoldingListProps {
  portfolio: Holding[];
}

export const PortfolioHoldingList: React.FC<PortfolioHoldingListProps> = ({
  portfolio,
}) => {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const toggleExpand = (symbol: string) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
  };

  const uniqueHoldings = useMemo(() => {
    const grouped = portfolio.reduce(
      (acc: Record<string, Holding & { lots: Holding[] }>, holding) => {
        const symbol = holding.symbol;

        if (!acc[symbol]) {
          acc[symbol] = {
            ...holding,
            lots: [holding],
          };
        } else {
          acc[symbol].lots.push(holding);

          const totalShares = acc[symbol].lots.reduce(
            (sum, lot) => sum + Number(lot.shares),
            0
          );
          const totalCost = acc[symbol].lots.reduce(
            (sum, lot) => sum + Number(lot.shares) * Number(lot.bought_at),
            0
          );
          acc[symbol].shares = totalShares;
          acc[symbol].avg_cost = totalCost / totalShares;
          acc[symbol].bought_at = holding.bought_at;
          (acc[symbol] as any).totalCost = totalCost; //stores directly into object
        }

        return acc;
      },
      {}
    );

    return Object.values(grouped);
  }, [portfolio]);

  return (
    <>
      {uniqueHoldings.map((stock) => {
        const isPositive = stock.last_change_pct >= 0;
        const isExpanded = expandedSymbol === stock.symbol;
        const marketValue = Number(stock.shares) * Number(stock.last_price);
        const totalCost =
          (stock as any).totalCost ??
          Number(stock.bought_at) * Number(stock.shares);
        const gainLoss = Number(Math.round(Number(marketValue - totalCost)).toFixed(2));
        const gainLossPercent =
          totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
        const hasMultipleLots = stock.lots && stock.lots.length > 1;

        return (
          <div key={stock.symbol} className="card stock-card mb-3">
            <div className="card-body">
              <div
                className="stock-card-header"
                onClick={() => toggleExpand(stock.symbol)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center flex-grow-1">
                    <div className="stock-icon me-3">
                      {stock.symbol.charAt(0)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-3 mb-1">
                        <h5 className="mb-0">{stock.symbol}</h5>
                        {hasMultipleLots && (
                          <span className="badge bg-secondary">
                            {stock.lots.length} lots
                          </span>
                        )}
                      </div>
                      <small className="text-muted">{stock.name}</small>
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
                    <div style={{ width: "24px", flexShrink: 0 }}>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-muted" />
                      ) : (
                        <ChevronDown size={20} className="text-muted" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div
                  className="mt-4 pt-4 stock-card-expanded"
                  style={{
                    borderTop: "1px solid rgba(73, 80, 87, 0.5)",
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="detail-card p-3">
                        <h6 className="text-muted mb-3">Position Details</h6>
                        <div className="detail-row">
                          <span className="text-muted">Total Shares:</span>
                          <span className="fw-semibold">
                            {Number(stock.shares).toFixed(2)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="text-muted">Average Cost:</span>
                          <span className="fw-semibold">
                            ${Number(stock.avg_cost).toFixed(2)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="text-muted">Current Price:</span>
                          <span className="fw-semibold">
                            ${Number(stock.last_price).toFixed(2)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="text-muted">Market Value:</span>
                          <span className="fw-semibold">
                            $
                            {marketValue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="detail-card p-3">
                        <h6 className="text-muted mb-3">Performance</h6>
                        <div className="detail-row">
                          <span className="text-muted">Total Cost:</span>
                          <span className="fw-semibold">
                            $
                            {totalCost.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="text-muted">Gain/Loss:</span>
                          <span
                            className={`fw-semibold ${
                              Number(gainLoss) > 0 ? "text-success" : Number(gainLoss) === 0 ? "text-white" :"text-danger"
                            }`}
                          >
                            {Number(gainLoss) > 0 ? "+" : Number(gainLoss) === 0? "":"-"}$
                            {Math.abs(Number(gainLoss)).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="text-muted">Return %:</span>
                          <span
                            className={`fw-semibold ${
                              gainLossPercent >= 0
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {gainLossPercent >= 0 ? "+" : ""}
                            {gainLossPercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="text-muted">Today's Change:</span>
                          <span
                            className={`fw-semibold ${
                              isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {stock.last_change_pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {hasMultipleLots && (
                      <div className="col-12">
                        <div className="detail-card p-3">
                          <h6 className="text-muted mb-3">
                            Purchase Lots ({stock.lots.length})
                          </h6>
                          {stock.lots.map((lot, index) => {
                            const lotCurrentValue = Number(lot.avg_cost);
                            const lotGainLoss =
                              (stock.last_price - lot.bought_at) * lot.shares;

                            const lotGainLossPct =
                              ((stock.last_price - lot.bought_at) /
                                lot.bought_at) *
                              100;

                            return (
                              <div key={index} className="lot-item mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="text-start">
                                    <div>
                                      <span className="badge bg-secondary me-2">
                                        Lot #{index + 1}
                                      </span>
                                      <span className="text-success">
                                        {Number(lot.shares).toFixed(2)}
                                      </span>
                                      <span className="text-muted">
                                        {" "}
                                        shares @{" "}
                                      </span>
                                      <span className="fw-semibold">
                                        ${Number(lot.bought_at).toFixed(2)}
                                      </span>
                                      <span className="ps-2 text-muted">
                                        (
                                        {stock.updated_at
                                          ? new Date(
                                              stock.updated_at
                                            ).toLocaleString()
                                          : "N/A"}
                                        )
                                      </span>
                                    </div>
                                    <div></div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-semibold">
                                      <span className="text-muted small pe-2 fw-normal">
                                        {" "}
                                        current value:
                                      </span>
                                      ${lotCurrentValue.toFixed(2)}
                                    </div>
                                    <small
                                      className={`${
                                        lotGainLoss >= 0
                                          ? "text-success"
                                          : "text-danger"
                                      }`}
                                    >
                                      {lotGainLoss >= 0 ? "+" : "-"}$
                                      {Math.abs(lotGainLoss).toFixed(2)} (
                                      {lotGainLossPct >= 0 ? "+" : ""}
                                      {lotGainLossPct.toFixed(2)}%)
                                    </small>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <div className="d-flex gap-2 justify-content-end mt-2">
                        <button className="btn btn-outline-secondary btn-sm">
                          View Chart
                        </button>
                        <button className="btn btn-outline-primary btn-sm">
                          Buy More
                        </button>
                        <button className="btn btn-outline-danger btn-sm">
                          Sell
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

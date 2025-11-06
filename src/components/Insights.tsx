import { Brain } from "lucide-react";
import {
  herfindahlIndex,
  numHoldingsRisk,
  sectorConcentration,
  getRiskScoreLabel,
  getDiversificationPercentage,
  getDiversificationPercentageColor,
} from "../data/insightsData";
import { useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";

interface InsightsProp {
  updateRiskScore: React.Dispatch<React.SetStateAction<number>>;
}
export const Insights: React.FC<InsightsProp> = ({
  updateRiskScore,
}) => {
  const {holdings, availableStocks: stocks_dict } = usePortfolio();
  const HI = herfindahlIndex(holdings, stocks_dict) * 10;
  const sectorScore = sectorConcentration(holdings, stocks_dict) * 10;
  const holdingRiskNum = numHoldingsRisk(holdings);

  const diversification = holdings.length ===0? 0 : getDiversificationPercentage(holdings, stocks_dict);
  const diversification_color = getDiversificationPercentageColor(diversification);
  const risk_score =  holdings.length === 0? 0 : Number(HI * 0.35 + sectorScore * 0.35 + holdingRiskNum * 0.3).toFixed(1);
    useEffect(() => {
    updateRiskScore(Number(risk_score));
  }, []);
  const risk_score_label = getRiskScoreLabel(Number(risk_score));
  return (
    <>
      <div className="card stats-card stats-card-ai mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <Brain size={20} className="me-2" />
            <h6 className="mb-0">AI Insights</h6>
          </div>
          <div className="mb-3">
            <small className="text-muted d-block mb-2">Risk Score</small>
            <div className="d-flex align-items-end gap-2">
              <h2
                className={`${
                  risk_score_label === "High Risk"
                    ? "text-danger"
                    : "text-primary"
                } mb-0`}
              >
                {risk_score}
              </h2>
              <small className="text-muted mb-1">/10</small>
            </div>
            <small
              className={
                risk_score_label === "High Risk" ? "text-danger" : "text-muted"
              }
            >
              {risk_score_label} !
            </small>
          </div>
          <hr />
          <div>
            <small className="text-muted d-block mb-2">Diversification</small>
            <h2 className={`${diversification_color[1]} mb-2`}>
              {diversification}%
            </h2>
            <div className="progress" style={{ height: "8px" }}>
              <div
                className={`progress-bar ${diversification_color[0]}
                `}
                style={{ width: `${diversification}%` }}
              ></div>
            </div>
            <small className={`${diversification_color[1]} d-block mt-2`}>
              Consider adding defensive sectors
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

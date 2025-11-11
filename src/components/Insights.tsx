import { Brain } from "lucide-react";

import { usePortfolio } from "../context/PortfolioContext";


export const Insights: React.FC = () => {

  const {riskScoreLabel: risk_score_label, riskScore:risk_score, diversificationColor:diversification_color, diversificationPct: diversification} = usePortfolio();

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

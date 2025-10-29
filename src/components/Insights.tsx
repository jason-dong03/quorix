import { Brain } from "lucide-react";

export const Insights: React.FC = () => {
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
              <h2 className="text-primary mb-0">7.8</h2>
              <small className="text-muted mb-1">/10</small>
            </div>
            <small className="text-muted">Moderate-High Risk</small>
          </div>
          <hr />
          <div>
            <small className="text-muted d-block mb-2">Diversification</small>
            <h2 className="text-warning mb-2">72%</h2>
            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-warning"
                style={{ width: "72%" }}
              ></div>
            </div>
            <small className="text-warning d-block mt-2">
              Consider adding defensive sectors
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

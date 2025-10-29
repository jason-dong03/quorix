import { TrendingUp } from "lucide-react";

interface TodaysPerformanceProps {
  todayGain?: number;
  todayGainPercent?: number;
  totalValue?: number;
}
export const TodaysPerformance: React.FC<TodaysPerformanceProps> = ({
  todayGain = 0,
  todayGainPercent = 0,
  totalValue = 0,
}) => {
  return (
    <>
      <div className="card stats-card stats-card-success mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <TrendingUp size={20} className="me-2" />
            <h6 className="mb-0">Today's Performance</h6>
          </div>
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Gain</small>
            <h2 className="text-success mb-0">
              +${todayGain.toLocaleString()}
            </h2>
          </div>
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Percentage</small>
            <h2 className="text-success mb-0">+{todayGainPercent}%</h2>
          </div>
          <hr />
          <div>
            <small className="text-muted d-block mb-1">Opening Value</small>
            <h5 className="mb-0">
              ${(totalValue - todayGain).toLocaleString()}
            </h5>
          </div>
        </div>
      </div>
    </>
  );
};

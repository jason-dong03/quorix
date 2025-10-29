export const PortfolioStats: React.FC = () => {
  return (
    <>
      <div className="card stats-card mb-4">
        <div className="card-body">
          <h6 className="mb-3">Portfolio Stats</h6>
          <div className="stat-row">
            <small className="text-muted">Total Invested</small>
            <span className="fw-semibold">$38,420.00</span>
          </div>
          <div className="stat-row">
            <small className="text-muted">Total Return</small>
            <span className="fw-semibold text-success">+$3,775.40</span>
          </div>
          <div className="stat-row">
            <small className="text-muted">Return %</small>
            <span className="fw-semibold text-success">+9.83%</span>
          </div>
          <div className="stat-row border-0">
            <small className="text-muted">Holdings</small>
            <span className="fw-semibold">5 stocks</span>
          </div>
        </div>
      </div>
    </>
  );
};

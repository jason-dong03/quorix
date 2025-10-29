export function QuickActions() {
  return (
    <>
      <div className="card stats-card">
        <div className="card-body">
          <h6 className="mb-3">Quick Actions</h6>
          <div className="d-grid gap-2">
            <button className="btn btn-primary">View Recommendations</button>
            <button className="btn btn-outline-secondary">
              Rebalance Portfolio
            </button>
            <button className="btn btn-outline-secondary">Export Report</button>
          </div>
        </div>
      </div>
    </>
  );
}

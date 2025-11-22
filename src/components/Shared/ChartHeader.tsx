import React from "react";

interface ChartHeaderProps {
  showSPY: boolean;
  showQQQ: boolean;
  showDIA: boolean;
  onToggleSPY: () => void;
  onToggleQQQ: () => void;
  onToggleDIA: () => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  showSPY,
  showQQQ,
  showDIA,
  onToggleSPY,
  onToggleQQQ,
  onToggleDIA,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center p-3 ps-4">
      <div className="dropdown">
        <button
          className="btn btn-sm btn-outline-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
        >
          Portfolio 1
        </button>
        <ul className="dropdown-menu">
          <li>
            <button className="dropdown-item active">Portfolio 1</button>
          </li>
          <li>
            <button className="dropdown-item disabled">Portfolio 2</button>
          </li>
          <li>
            <button className="dropdown-item disabled">Create new…</button>
          </li>
        </ul>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div
          className="btn-group index-toggle-group"
          role="group"
          aria-label="Compare Indexes"
        >
          <button
            type="button"
            aria-pressed={showSPY}
            className={`btn btn-sm index-btn spy ${showSPY ? "active" : ""}`}
            onClick={onToggleSPY}
          >
            S&amp;P 500
          </button>
          <button
            type="button"
            aria-pressed={showQQQ}
            className={`btn btn-sm index-btn qqq ${showQQQ ? "active" : ""}`}
            onClick={onToggleQQQ}
          >
            Nasdaq
          </button>
          <button
            type="button"
            aria-pressed={showDIA}
            className={`btn btn-sm index-btn dia ${showDIA ? "active" : ""}`}
            onClick={onToggleDIA}
          >
            Dow Jones
          </button>
        </div>
      </div>
    </div>
  );
};
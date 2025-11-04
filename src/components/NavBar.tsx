import React from "react";
import { Menu, User, PieChart } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getRiskScoreLabel } from "../data/insightsData";

interface NavBarProps {
  risk_score: number;
}
const NavBar: React.FC<NavBarProps> = ({ risk_score }) => {
  const { user } = useAuth();
  const risk_score_label = getRiskScoreLabel(Number(risk_score));

  if (!user) return null;
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: "rgba(15, 23, 42, 0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="container-fluid px-3">
        <a
          className="navbar-brand d-flex align-items-center fw-semibold"
          href="#"
        >
          <img src="/logo.png" className="text-primary nav-bar-logo"/>
          <span>quorix+</span>
        </a>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <Menu size={24} />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          {/* Center: Nav links */}
          <ul className="navbar-nav mx-lg-auto my-3 my-lg-0 gap-lg-3">
            <li className="nav-item">
              <a
                className="nav-link active fw-semibold"
                aria-current="page"
                href="#"
              >
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-secondary" href="#">
                Portfolio
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-secondary" href="#">
                Watchlist
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-secondary" href="#">
                Research
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-secondary" href="#">
                Profile
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-lg-3">
            <div className="text-end d-none d-lg-block me-3">
              <div className="small text-light fw-semibold">{user.name}</div>
              <div
                className="small text-secondary"
                style={{ fontSize: "0.75rem" }}
              >
                Risk:{" "}
                <span
                  className={`${
                    risk_score_label === "High Risk"
                      ? "text-danger"
                      : "text-secondary"
                  }`}
                >
                {risk_score}
                </span>{" "}
                / 10
              </div>
            </div>

            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  referrerPolicy="no-referrer"
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

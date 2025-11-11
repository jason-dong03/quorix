import React from "react";
import { Menu, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import { usePortfolio } from "../context/PortfolioContext";


const NavBar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const {riskScore} = usePortfolio();
  function isActive(path: string) {
    return location.pathname === path;
  }


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
          <span className="brand-text">quorix+</span>
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
          <ul className="navbar-nav mx-lg-auto my-3 my-lg-0 gap-lg-3">
            <li className="nav-item">
              <Link
                className={`nav-link fw-semibold ${isActive("/dashboard") ? "active text-white" : "text-secondary"}`}
                to="/dashboard"
              >
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link fw-semibold ${isActive("/portfolio") ? "active text-white" : "text-secondary"}`}
                to="/portfolio"
              >
                Portfolio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link fw-semibold ${isActive("/leaderboard") ? "active text-white" : "text-secondary"}`}
                to="/leaderboard"
              >
                Leaderboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link fw-semibold ${isActive("/research") ? "active text-white" : "text-secondary"}`}
                to="/research"
              >
                Research
              </Link>
            </li>
             <li className="nav-item">
              <Link
                className={`nav-link fw-semibold ${isActive("/profile") ? "active text-white" : "text-secondary"}`}
                to="/profile"
              >
                Profile
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-lg-3">
            <div className="text-end d-none d-lg-block me-3">
              <div className="small text-light fw-semibold">{user.name}</div>
              <small className="small text-muted">Risk: {riskScore} / 10</small>
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

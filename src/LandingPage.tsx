import React from "react";
import { PieChart } from "lucide-react";
import "./css/LandingPage.css";

const LandingPage: React.FC = () => {
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="landing-wrapper">
      <div className="landing-card">
        <div className="brand-row">
          <div className="brand-icon">
            <PieChart size={20} />
          </div>
          <div className="brand-text">quorix +</div>
        </div>
        <h1 className="landing-headline">AI-driven portfolio intelligence</h1>

        <p className="landing-subtext">
          Real-time AI insights, risk scoring, and stock recommendations — all
          in one dashboard.
        </p>
        <button className="google-btn" onClick={handleGoogleSignIn}>
          <img
            className="google-logo"
            alt="Google"
            src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
          />
          <span>Sign in with Google</span>
        </button>

        <p className="legal-text">
          By continuing you agree to our{" "}
          <a href="#" className="legal-link">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="legal-link">
            Privacy Policy
          </a>
          .
        </p>
      </div>
      <footer className="landing-footer">
        © 2025 quorix +. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;

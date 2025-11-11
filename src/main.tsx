
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";

import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard.tsx";
import Portfolio from "./Portfolio.tsx"

import ProtectedRoute from "./auth/ProtectedRoute";
import { PortfolioProvider } from "./context/PortfolioContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/dashboard"
            element={
               <PortfolioProvider>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
              </PortfolioProvider>
            }
          />
          <Route 
            path= "/portfolio"
            element={
                <PortfolioProvider>
                  <ProtectedRoute>
                      <Portfolio/>
                    </ProtectedRoute>
                </PortfolioProvider>
          }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
);

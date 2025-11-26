import React, { useCallback, useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";

interface ChartHeaderProps {
  showSPY: boolean;
  showQQQ: boolean;
  showDIA: boolean;
  onToggleSPY: () => void;
  onToggleQQQ: () => void;
  onToggleDIA: () => void;
}

type InvestmentGoal = "wealth-building" | "retirement" | "passive-income" | "learning";
type RiskLevel = "conservative" | "moderate" | "aggressive";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";

interface CreatePortfolioPayload {
  name: string;
  investmentGoal: InvestmentGoal;
  risk: RiskLevel;
  experience: ExperienceLevel;
}

interface CreatePortfolioModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (data: CreatePortfolioPayload) => Promise<void> | void;
}

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  show,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [investmentGoal, setInvestmentGoal] =useState<InvestmentGoal>("wealth-building");
  const [risk, setRisk] = useState<RiskLevel>("moderate");
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onCreate({name: name.trim(), investmentGoal: investmentGoal, risk:risk, experience});

      setName("");
      setInvestmentGoal("wealth-building");
      setRisk("moderate");
      setExperience("intermediate");
      onClose();
    } catch (err) {
      console.error("Failed to create portfolio:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop-custom" onClick={onClose} />
      <div className="modal d-block portfolio-modal" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content portfolio-modal-content">
            <div className="modal-header portfolio-modal-header">
              <h5 className="modal-title">Create new portfolio</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body portfolio-modal-body">
                <div className="mb-3">
                  <label className="form-label portfolio-label">
                    Portfolio name
                  </label>
                  <input
                    type="text"
                    className="form-control portfolio-input"
                    placeholder="e.g. Long-term growth"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label portfolio-label">
                    Investment goal
                  </label>
                  <select
                    className="form-select portfolio-select"
                    value={investmentGoal}
                    onChange={(e) =>
                      setInvestmentGoal(e.target.value as InvestmentGoal)
                    }
                  >
                    <option value="wealth-building">Wealth building</option>
                    <option value="retirement">Retirement</option>
                    <option value="passive-income">Passive income</option>
                    <option value="learning">Learning</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label portfolio-label">
                    Risk profile
                  </label>
                  <select
                    className="form-select portfolio-select"
                    value={risk}
                    onChange={(e) => setRisk(e.target.value as RiskLevel)}
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                <div className="mb-1">
                  <label className="form-label portfolio-label">
                    Experience level
                  </label>
                  <select
                    className="form-select portfolio-select"
                    value={experience}
                    onChange={(e) =>
                      setExperience(e.target.value as ExperienceLevel)
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer portfolio-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary portfolio-btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn portfolio-btn-primary"
                  disabled={submitting || !name.trim()}
                >
                  {submitting ? "Creating..." : "Create portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  showSPY,
  showQQQ,
  showDIA,
  onToggleSPY,
  onToggleQQQ,
  onToggleDIA,
}) => {
  const {portfolios,currentPortfolio,switchPortfolio,createPortfolio,} = usePortfolio();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelectPortfolio = useCallback(
    (portfolioId: number) => {
      switchPortfolio(portfolioId);
    },
    [switchPortfolio]
  );

  const handleCreatePortfolio = useCallback(
    async (payload: CreatePortfolioPayload) => {
      const description = `${payload.investmentGoal},${payload.risk},${payload.experience}`;
      await createPortfolio(payload.name, description);
    },
    [createPortfolio]
  );

  const currentLabel = currentPortfolio?.name ?? "Select portfolio";

  return (
    <>
      <div className="d-flex justify-content-between align-items-center p-3 ps-4">
        <div className="dropdown">
          <button
            className="btn dropdown-toggle portfolio-dropdown-toggle ps-3"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="portfolio-avatar">
              {currentPortfolio
                ? currentPortfolio.name.charAt(0).toUpperCase()
                : "P"}
            </span>
            <span className="portfolio-dropdown-label">{currentLabel}</span>
          </button>

          <ul className="dropdown-menu portfolio-dropdown-menu">
            {portfolios.map((p) => {
              const isCurrent = currentPortfolio?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`dropdown-item portfolio-dropdown-item ${
                      isCurrent ? "portfolio-dropdown-item--active" : ""
                    }`}
                    onClick={() => handleSelectPortfolio(p.id)}
                  >
                    <span>{p.name}</span>
                    {p.is_default && (
                      <span className="portfolio-pill-default">Default</span>
                    )}
                  </button>
                </li>
              );
            })}

            <li>
              <hr className="portfolio-dropdown-divider" />
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item portfolio-dropdown-create"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <span className="portfolio-dropdown-create-plus">+</span>
                <span>Create new portfolio</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Index toggle buttons */}
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

      <CreatePortfolioModal
        show={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePortfolio}
      />
    </>
  );
};

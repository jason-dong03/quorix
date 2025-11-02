import { useEffect, useState } from "react";
import { aiNews } from "../data/newsData";
import { Brain, ChevronRight, ChevronLeft } from "lucide-react";

function AINewsBar() {
  const [newsIndex, setNewsIndex] = useState<number>(0);
  const [newsExpanded, setNewsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % aiNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [aiNews.length]);
  const currentNews = aiNews[newsIndex];
  return (
    <>
      <div
        className={`card news-card mb-4 ${newsExpanded ? "news-expanded" : ""}`}
      >
        <div className="card-body">
          {!newsExpanded ? (
            <div className="d-flex align-items-center justify-content-between">
              <button
                onClick={() =>
                  setNewsIndex(
                    (prev) => (prev - 1 + aiNews.length) % aiNews.length
                  )
                }
                className="btn btn-link text-white p-2"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="d-flex align-items-center justify-content-center flex-grow-1 px-4">
                <div className="d-flex align-items-center me-3">
                  <Brain size={20} className="brain-icon text-primary me-2" />
                  <span className="badge bg-primary text-uppercase small">
                    AI Insight
                  </span>
                </div>
                <div className="flex-grow-1 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <h5 className="mb-0">{currentNews.title}</h5>
                    <span
                      className={`badge ${
                        currentNews.impact === "positive"
                          ? "bg-success"
                          : "bg-danger-badge"
                      }`}
                    >
                      {currentNews.ticker}
                    </span>
                    <small className="text-muted">
                      Relevance: {currentNews.relevance}%
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-1 ms-3">
                  {aiNews.map((_, idx) => (
                    <div
                      key={idx}
                      className={`news-indicator ${
                        idx === newsIndex ? "active" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setNewsIndex((prev) => (prev + 1) % aiNews.length)
                }
                className="btn btn-link text-white p-2"
              >
                <ChevronRight size={20} />
              </button>

              <button
                onClick={() => setNewsExpanded(true)}
                className="btn btn-outline-primary ms-3"
              >
                Expand
              </button>
            </div>
          ) : (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <Brain size={24} className="text-primary" />
                  <h2 className="mb-0">AI News Feed</h2>
                  <span className="badge bg-primary">
                    {aiNews.length} Articles
                  </span>
                </div>
                <button
                  onClick={() => setNewsExpanded(false)}
                  className="btn btn-secondary"
                >
                  Collapse
                </button>
              </div>

              <div className="row g-3 news-grid">
                {aiNews.map((news, idx) => (
                  <div key={idx} className="col-md-4">
                    <div className="card news-item h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span
                            className={`badge ${
                              news.impact === "positive"
                                ? "bg-success"
                                : "bg-danger-badge"
                            }`}
                          >
                            {news.ticker}
                          </span>
                          <small className="text-muted">
                            {news.relevance}%
                          </small>
                        </div>
                        <h6 className="card-title">{news.title}</h6>
                        <p className="card-text small text-muted news-summary">
                          {news.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AINewsBar;
